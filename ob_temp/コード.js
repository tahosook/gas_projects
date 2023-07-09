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
	let json = JSON.parse(e.postData.contents);
	if (json.events == null || json.events.length == 0) {
		let msg = "Can't get LINE events.";
		console.log(msg);
		return;
	}

	let eventData = json.events[0];
	//取得したデータから、応答用のトークンを取得
	let replyToken = eventData.replyToken;
	//取得したデータから、メッセージ種別を取得
	let messageType = eventData.message.type;
	if (messageType != "text") {
		let msg = "Can't support " + messageType + " message";
		return replyLineMessage(msg, replyToken);
	}

	//取得したデータから、ユーザーが投稿したメッセージを取得
	let userMessage = eventData.message.text;
	if (userMessage == "スキップ") {
		let msg = cmdSetOnholdTime();
		return replyLineMessage(msg, replyToken);
	} else if (userMessage == "状況") {
		let msg = cmdGetStatus();
		return replyLineMessage(msg, replyToken);
	} else if (userMessage == "クリア") {
		let msg = cmdClearOnholdTime();
		return replyLineMessage(msg, replyToken);
	}

	// コマンドに当てはまらなければ エラーを返す
	let replyMessage = "投稿種別:" + messageType + "\n投稿内容:" + userMessage
		+ "\nコマンド: スキップ,状況,クリア"
		+ "\nhttps://ambidata.io/bd/board.html?id=907"
		+ "\n" + cmdGetStatus();
	return replyLineMessage(replyMessage, replyToken);
}

// メイン関数
function myFunction() {
	let time = checkObservationTime();
	if (time.onhold == true) {
		// 処理をスキップする
		console.log(time.text);
		return;
	}

	let ambi = checkAmbidata();
	console.log(ambi.text);

	// 閾値(ALERT)を超えたら LINEに通知
	let alert_temperature = PropertiesService.getScriptProperties().getProperty("ALERT_TEMPERATURE");
	let alert_humidity = PropertiesService.getScriptProperties().getProperty("ALERT_HUMIDITY");
	let alert_wbgt = PropertiesService.getScriptProperties().getProperty("ALERT_WBGT");
	let skip_wbgt = PropertiesService.getScriptProperties().getProperty("SKIP_WBGT");
	if (ambi.wbgt < skip_wbgt) { // WBGT値が一定値よりも低ければ LINEメッセージしない
		return;
	}

	if (ambi.t > alert_temperature || ambi.h > alert_humidity || ambi.wbgt > alert_wbgt) {
		postLineMessage(ambi.text);
	}
}

// 現在の状況を確認
function cmdGetStatus() {
	let text = "";
	let alert_temperature = PropertiesService.getScriptProperties().getProperty("ALERT_TEMPERATURE");
	let alert_humidity = PropertiesService.getScriptProperties().getProperty("ALERT_HUMIDITY");
	let alert_wbgt = PropertiesService.getScriptProperties().getProperty("ALERT_WBGT");
	text += "監視閾値: " + alert_temperature + "℃ " + alert_humidity + "% WBGT=" + alert_wbgt;

	let time = checkObservationTime();
	if (time.onhold == true) {
		// スキップ中
		text += "\n" + time.text;
	} else {
		text += "\n監視中";
	}

	let ambi = checkAmbidata();
	text += "\n" + ambi.text;

	console.log(text);
	return text;
}

// 監視をするか確認
function cmdSetOnholdTime() {
	const HOUR = 8;

	let text = "";
	let now = new Date();
	let onhold = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, HOUR, 0, 0, 0);

	PropertiesService.getScriptProperties().setProperty("ONHOLD_TIME", onhold);

	text = Utilities.formatDate(onhold, "JST", "M/d H:mm") + "まで温度監視しません";
	return text;
}

// 監視保留期間をクリア
function cmdClearOnholdTime() {
	PropertiesService.getScriptProperties().setProperty("ONHOLD_TIME", "");
	return "監視再開します";
}

// 監視をするか確認
function checkObservationTime() {
	let text = "";
	let onhold = false;
	let now = new Date();

	// 監視の保留期間を取得
	let onhold_time = PropertiesService.getScriptProperties().getProperty("ONHOLD_TIME");
	let onhold_date = new Date(onhold_time);
	if (onhold_time && now.getTime() < onhold_date.getTime()) {
		// 監視の保留期間以内
		onhold = true;
		text = Utilities.formatDate(onhold_date, "JST", "M/d H:mm") + "まで 監視停止中";
	}

	return { onhold: onhold, text: text };
}

// ambidata.io から気温湿度の直近平均値を取得
function checkAmbidata() {
	const AMBI_COUNT = 4; // 過去 何回分を遡るか？
	const AMBI_URL = "https://ambidata.io/api/v2/channels/1140/data?readKey=f6ef7a046e8aee0a&n=" + AMBI_COUNT;

	// ambidata.io から 気温、湿度を取得
	let response = UrlFetchApp.fetch(AMBI_URL)
	let responseText = response.getContentText()
	let json = JSON.parse(responseText);
	let sum_temperature = 0;
	let sum_humidity = 0;
	for (let data of json) {
		sum_temperature += data["d1"];
		sum_humidity += data["d2"];
	}

	// AMBI_COUNT分の気温湿度を取得し、平均値を作成
	let text = "";
	let temperature = Math.round(sum_temperature / AMBI_COUNT * 10) / 10;
	let humidity = Math.round(sum_humidity / AMBI_COUNT * 10) / 10;
	text += '気温:' + temperature + "℃ 湿度:" + humidity + "%";

	// 簡易版WBGT計算(我流で計算式作成)
	//let wbgt_simplified = Math.round((temperature - (100 - humidity) * 0.11) * 10) / 10;
	//text += " " + wbgt_simplified + "wbgt";

	// 簡易版WBGT計算(ChatGPT計算式作成)
	let wbgt_chatgpt = calculateWBGT(temperature, humidity).toFixed(1);
	text += " " + wbgt_chatgpt + "wbgt";

	return {
		t: temperature,
		h: humidity,
		wbgt: wbgt_chatgpt,
		text: text
	};
}

// WBGT の簡易計算
function calculateWBGT(temperature, humidity) {
	var dewPoint = temperature - ((100 - humidity) / 5);
	var wbgt = 0.7 * temperature + 0.2 * dewPoint;
	return wbgt;
}

// 気温湿度をLINEに通知
function postLineMessage(text) {
	let lineUserid = PropertiesService.getScriptProperties().getProperty("LINE_USERID");

	// LINEとの疎通確認の時などで postLineMessage を引数なしで実行してみる場合には 何かしらメッセージを入れておく
	if (text == undefined) {
		text = "empty message";
	}

	const URL = 'https://api.line.me/v2/bot/message/push';
	const payload = {
		to: lineUserid, //ユーザーID
		messages: [
			{ type: 'text', text: text }
		]
	};

	fetchUrl(URL, payload);
}

// LINEから受けたメッセージに応答
function replyLineMessage(replyMessage, replyToken) {
	const URL = 'https://api.line.me/v2/bot/message/reply';
	const payload = {
		replyToken: replyToken,
		messages: [
			{ type: 'text', text: replyMessage }
		]
	};

	console.log("replyLineMessage:" + replyMessage);
	fetchUrl(URL, payload);
}

// UrlFetch
function fetchUrl(url, payload) {
	let lineAccesstoken = PropertiesService.getScriptProperties().getProperty("LINE_ACCESSTOKEN");

	const params = {
		method: 'post',
		contentType: 'application/json',
		headers: {
			Authorization: 'Bearer ' + lineAccesstoken
		},
		payload: JSON.stringify(payload)
	};

	console.log("URL=" + url + " params=" + JSON.stringify(params));
	UrlFetchApp.fetch(url, params);
}