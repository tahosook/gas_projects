// 気温湿度を監視して 閾値を超えたら LINE通知するスクリプト
// https://ambidata.io/bd/board.html?id=907

// テスト用
function doGet(e) {
	console.log("doGet");
	Logger.log(e);
	return ContentService.createTextOutput("GET:" + cmdGetStatus());
}

// LINEからのメッセージに応答する
function doPost(e) {
	console.log("doPOST");
	Logger.log(e);

	// WebHookで取得したJSONデータをオブジェクト化し、取得
	const json = JSON.parse(e.postData.contents);
	if (!json.events || json.events.length === 0) {
		let msg = "Can't get LINE events.";
		console.log(msg);
		return;
	}

	const eventData = json.events[0];
	//取得したデータから、応答用のトークンを取得
	const replyToken = eventData.replyToken;
	//取得したデータから、メッセージ種別を取得
	const messageType = eventData.message.type;
	if (messageType !== "text") {
		const msg = "Can't support " + messageType + " message";
		return replyLineMessage(msg, replyToken);
	}

	//取得したデータから、ユーザーが投稿したメッセージを取得
	const userMessage = eventData.message.text;
	if (userMessage === "スキップ") {
		const msg = cmdSetOnholdTime();
		return replyLineMessage(msg, replyToken);
	} else if (userMessage === "状況") {
		const msg = cmdGetStatus();
		return replyLineMessage(msg, replyToken);
	} else if (userMessage === "クリア") {
		const msg = cmdClearOnholdTime();
		return replyLineMessage(msg, replyToken);
	}

	// コマンドに当てはまらなければ エラーを返す
	const replyMessage =
		"投稿種別: " + messageType + "\n投稿内容: " + userMessage +
		"\nコマンド: スキップ, 状況, クリア\n" +
		"https://ambidata.io/bd/board.html?id=907\n" +
		cmdGetStatus();

	return replyLineMessage(replyMessage, replyToken);
}

// メイン関数
function myFunction() {
	const time = checkObservationTime();
	if (time.onhold) {
		// 処理をスキップする
		console.log(time.text);
		return;
	}

	const ambi = checkAmbidata();
	console.log(ambi.text);

	// 閾値(ALERT)を超えたら LINEに通知
	const alertTemperature = getScriptProperty("ALERT_TEMPERATURE");
	const alertHumidity = getScriptProperty("ALERT_HUMIDITY");
	const alertWBGT = getScriptProperty("ALERT_WBGT");
	const skipWBGT = getScriptProperty("SKIP_WBGT");

	// WBGT値が一定値よりも低ければ LINEメッセージしない
	if (ambi.wbgt < skipWBGT) {
		return;
	}

	if (ambi.t > alertTemperature || ambi.h > alertHumidity || ambi.wbgt > alertWBGT) {
		postLineMessage(ambi.text);
	}
}

// 現在の状況を確認
function cmdGetStatus() {
	const alertTemperature = getScriptProperty("ALERT_TEMPERATURE");
	const alertHumidity = getScriptProperty("ALERT_HUMIDITY");
	const alertWBGT = getScriptProperty("ALERT_WBGT");

	let text = "監視閾値: " + alertTemperature + "℃ " + alertHumidity + "% WBGT=" + alertWBGT;

	const time = checkObservationTime();
	text += time.onhold ? "\n" + time.text : "\n監視中";

	const ambi = checkAmbidata();
	text += "\n" + ambi.text;

	console.log(text);
	return text;
}

// 監視をするか確認
function cmdSetOnholdTime() {
	const HOUR = 8;
	const now = new Date();
	const onhold = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, HOUR, 0, 0, 0);

	setScriptProperty("ONHOLD_TIME", onhold);

	const text = Utilities.formatDate(onhold, "JST", "M/d H:mm") + "まで温度監視しません";
	return text;
}

// 監視保留期間をクリア
function cmdClearOnholdTime() {
	setScriptProperty("ONHOLD_TIME", "");
	return "監視再開します";
}

// 監視をするか確認
function checkObservationTime() {
	const now = new Date();
	// 監視の保留期間を取得
	const onholdTime = getScriptProperty("ONHOLD_TIME");
	const onholdDate = new Date(onholdTime);
	const onhold = onholdTime && now.getTime() < onholdDate.getTime();

	const text = onhold ? Utilities.formatDate(onholdDate, "JST", "M/d H:mm") + "まで 監視停止中" : "";
	return { onhold, text };
}

// ambidata.io から気温湿度の直近平均値を取得
function checkAmbidata() {
	// 過去 何回分を遡るか？
	const AMBI_COUNT = 4;
	const AMBI_URL = "https://ambidata.io/api/v2/channels/1140/data?readKey=f6ef7a046e8aee0a&n=" + AMBI_COUNT;

	// ambidata.io から 気温、湿度を取得
	const response = UrlFetchApp.fetch(AMBI_URL);
	const jsonData = JSON.parse(response.getContentText());

	let sumTemperature = 0;
	let sumHumidity = 0;
	for (const data of jsonData) {
		sumTemperature += data.d1;
		sumHumidity += data.d2;
	}

	// AMBI_COUNT分の気温湿度を取得し、平均値を作成
	const temperature = Math.round((sumTemperature / AMBI_COUNT) * 10) / 10;
	const humidity = Math.round((sumHumidity / AMBI_COUNT) * 10) / 10;

	// 簡易版WBGT計算(ChatGPT計算式作成)
	const wbgt = calculateWBGT(temperature, humidity).toFixed(1);

	const text = '気温: ' + temperature + "℃ 湿度: " + humidity + "%" + " " + wbgt + "wbgt";

	return {
		t: temperature,
		h: humidity,
		wbgt: wbgt,
		text: text,
	};
}

// WBGT の簡易計算
function calculateWBGT(temperature, humidity) {
	// 簡易版WBGT計算(我流で計算式作成)
	//let wbgt = Math.round((temperature - (100 - humidity) * 0.11) * 10) / 10;

	// ChatGPT版
	const dewPoint = temperature - ((100 - humidity) / 5);
	const wbgt = 0.7 * temperature + 0.3 * dewPoint;
	return wbgt;
}

// 気温湿度をLINEに通知
function postLineMessage(text) {
	const url = 'https://api.line.me/v2/bot/message/push';
	const lineUserId = getScriptProperty("LINE_USERID");

	// LINEとの疎通確認の時などで postLineMessage を引数なしで実行してみる場合には 何かしらメッセージを入れておく
	if (text == undefined) {
		text = "empty message";
	}

	const payload = {
		to: lineUserId,
		messages: [
			{ type: 'text', text: text },
		],
	};
	fetchUrl(url, payload);
}

// LINEから受けたメッセージに応答
function replyLineMessage(replyMessage, replyToken) {
	const url = 'https://api.line.me/v2/bot/message/reply';
	const payload = {
		replyToken: replyToken,
		messages: [
			{ type: 'text', text: replyMessage },
		],
	};

	console.log("replyLineMessage:" + replyMessage);
	fetchUrl(url, payload);
}

// スクリプトプロパティを取得
function getScriptProperty(propertyName) {
	return PropertiesService.getScriptProperties().getProperty(propertyName);
}

// スクリプトプロパティを設定
function setScriptProperty(propertyName, value) {
	PropertiesService.getScriptProperties().setProperty(propertyName, value);
}

// UrlFetch
function fetchUrl(url, payload) {
	const lineAccessToken = getScriptProperty("LINE_ACCESSTOKEN");
	const params = {
		method: 'post',
		contentType: 'application/json',
		headers: {
			Authorization: 'Bearer ' + lineAccessToken,
		},
		payload: JSON.stringify(payload),
	};

	console.log("URL=" + url + " params=" + JSON.stringify(params));
	UrlFetchApp.fetch(url, params);
}
