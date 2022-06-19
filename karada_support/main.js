//=================================== Properties


//=================================== fitbit
/**
* Authorizes and makes a request to the FitBit API.
*/
function fitbitAuthorize() {
  var service = getService();
  if (service.hasAccess()) {
    Logger.log('Already authorized(fitbit)');
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
               authorizationUrl);
  }
}

/**
* Reset the authorization state, so that it can be re-tested.
*/
function fitbitReset() {
  getService().reset();
}

/**
* Configures the service.
*/
function getService() {
  const FITBIT_ID = PropertiesService.getScriptProperties().getProperty("FITBIT_ID");
  const FITBIT_SECRET = PropertiesService.getScriptProperties().getProperty("FITBIT_SECRET");
  
  return OAuth2.createService('FitBit')
  // Set the endpoint URLs.
  .setAuthorizationBaseUrl('https://www.fitbit.com/oauth2/authorize')
  .setTokenUrl('https://api.fitbit.com/oauth2/token')
  
  // Set the client ID and secret.
  .setClientId(CLIENT_ID)
  .setClientSecret(CLIENT_SECRET)
  
  // Set the name of the callback function that should be invoked to
  // complete the OAuth flow.
  .setCallbackFunction('fitbitAuthCallback')
  
  // Set the property store where authorized tokens should be persisted.
  .setPropertyStore(PropertiesService.getUserProperties())
  
  // Set the scope and additional headers required by the FitBit API.
  .setScope('weight')
  .setTokenHeaders({
    'Authorization': 'Basic ' +
    Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)
  });
}

/**
* Handles the OAuth callback.
*/
function fitbitAuthCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
* Logs the redict URI to register.
*/
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}

/**
* Logs the redict URI to register.
*/
function postWeightAndFat(weight, bodyfat) {
  var service = getService();
  var logDate = Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd");
  var endPointUrl = 'https://api.fitbit.com/1/user/-/body/log/weight.json';
  var response = UrlFetchApp.fetch(endPointUrl, {
    method: 'POST',
    payload: {
      weight: weight,
      date: logDate
    },
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  });
  result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
  
  endPointUrl = 'https://api.fitbit.com/1/user/-/body/log/fat.json';
  response = UrlFetchApp.fetch(endPointUrl, {
    method: 'POST',
    payload: {
      fat: bodyfat,
      date: logDate
    },
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  });
  result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
}

//=================================== twitter
//認証用インスタンスの生成
const TWITTER_APIKEY = PropertiesService.getScriptProperties().getProperty("TWITTER_APIKEY");
const TWITTER_SECRET = PropertiesService.getScriptProperties().getProperty("TWITTER_SECRET");
var twitter = TwitterWebService.getInstance(
  TWITTER_APIKEY,//API Key
  TWITTER_SECRET//API secret key
);

//アプリを連携認証する
function twitterAuthorize() {
  twitter.authorize();
}

//認証を解除する
function twitterReset() {
  twitter.reset();
}

//認証後のコールバック
function authCallback(request) {
  return twitter.authCallback(request);
}

// ツイートを投稿
function postTweet(status, graph) {
  var service = twitter.getService();
  var img_option = {
    'method': "POST",
    'payload': { 'media_data': graph }
  };
  
  var mediaUpload = 'https://upload.twitter.com/1.1/media/upload.json';
  var image_upload = JSON.parse(service.fetch(mediaUpload, img_option));
  
  var statusUpdate = 'https://api.twitter.com/1.1/statuses/update.json';
  var response = service.fetch(statusUpdate, {
    method: 'post',
    payload: {
      status: status,
      'media_ids': image_upload['media_id_string'],
    }
  });
}

//=================================== Google Spreadsheet
// Google spreadsheet & Driveに保存し、グラフデータを返す
function saveGoogleAndMakeGraph(args) {
  var SHEET_ID = "1IaudaGO3nQFHBj5r6pIcgDZo7g3WW1mpo8B0NoRq9Sk";
  var FOLDER_ID = "1YNF-ThUQ67kYnAd8Pf39_1u4NnVYwmg-";
  
  //可変長引数を取得し、先頭列に日付挿入
  var var_args = [];
  for (var i = 0; i < arguments.length; i++) {
    var_args.push(arguments[i]);
  }
  var_args.unshift(new Date());
  
  // IDからスプレッドシートを取得
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  // 最初のシートを取得
  var sheet = spreadsheet.getSheets()[0];

  // 最初の行を取得。同じデータなら処理終了
  var prev_values = sheet.getRange(2, 2, 1, 4).getValues();
  if( +var_args[1] == +prev_values[0][0] &&
     +var_args[2] == +prev_values[0][1] &&
     +var_args[3] == +prev_values[0][2] &&
     +var_args[4] == +prev_values[0][3] ){
    Logger.log("same as previous data");

    return null;
  }
  
  // 1行を追加
  var values = [var_args];
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, var_args.length).setValues(values);
  
  // chartを取得
//  var charts = sheet.getCharts();
//  var chartBlob = charts[0].getBlob();

  var range = sheet.getRange("A1:B15")
  var chart = sheet.getCharts()[0];
  chart = chart.modify().clearRanges()
    .addRange(range)
    .build();
  sheet.updateChart(chart);  
  
  //フォルダにcreateFileメソッドを実行して、ファイルを作成
  //  var folder = DriveApp.getFolderById(FOLDER_ID);
  //  folder.createFile(chartBlob.getAs('image/png').setName("graph.png"));
  
  return Utilities.base64Encode(chart.getBlob().getBytes());
}

//=================================== MAIN
function main() {
  var url = "https://healthcare.mb.softbank.jp/v3/web_login";
  const SBHC_TELNO = PropertiesService.getScriptProperties().getProperty("SBHC_TELNO");
  const SBHC_PASSWD = PropertiesService.getScriptProperties().getProperty("SBHC_PASSWD");

  var payload = {
    "user_id": "1",
    "telno": SBHC_TELNO,
    "passwd": SBHC_PASSWD,
  }
  var options = {
    "method": "POST",
    "payload": payload,
    "followRedirects": false
  }
  var response = UrlFetchApp.fetch(url, options);
  var headers = response.getAllHeaders();
  var str = "";
  var cookies = [];
  if (typeof headers['Set-Cookie'] !== 'undefined') {
    // Set-Cookieヘッダーが2つ以上の場合はheaders['Set-Cookie']の中身は配列
    var cookie = typeof headers['Set-Cookie'] == 'string' ? [headers['Set-Cookie']] : headers['Set-Cookie'];
    for (var i = 0; i < cookie.length; i++) {
      // Set-Cookieヘッダーからname=valueだけ取り出し、セミコロン以降の属性は除外する
      cookies[i] = cookie[i].split(';')[0];
    };
    
  }
  for (var s in cookies) {
    str += cookies[s] + ";";
  }
  
  // --- json取得
  headers = {
    "Cookie": str
  }
  // リクエストオプションにheadersを設定
  options = {
    "method": "GET",
    "muteHttpExceptions": true,
    "headers": headers
  }
  
  var date = new Date();
  var formatDate = Utilities.formatDate(date, "JST", "yyyyMMdd");
  url = "https://healthcare.mb.softbank.jp/v3/web_api_get_home_summary?date=" + formatDate;
  response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response);
  // Logger.log("today(" + formatDate + "):" + response);
  
  // 1日前と同じであったら登録しない
  // date.setDate(date.getDate() - 1);
  // formatDate = Utilities.formatDate(date, "JST", "yyyyMMdd");
  // url = "https://healthcare.mb.softbank.jp/v3/web_api_get_home_summary?date=" + formatDate;
  // var response2 = UrlFetchApp.fetch(url, options);
  // var json2 = JSON.parse(response2);
  // Logger.log("yesterday(" + formatDate + "):" + response2);
  // if (json.root.weight == json2.root.weight &&
  //   json.root.bodyfat == json2.root.bodyfat &&
  //   json.root.bmi == json2.root.bmi &&
  //   json.root.bmr == json2.root.bmr) {
  // Logger.log("skip");
  // return;
  // }
  
  // --- google spreadsheet & drive(weight graph)
  var b64graph = saveGoogleAndMakeGraph(
    json.root.weight,
    json.root.bodyfat,
    json.root.bmi,
    json.root.bmr,
    json.root.bodyage,
    json.root.muscle,
    json.root.bone,
    json.root.visceralfat,
    json.root.tbw);
  
  if( b64graph != null ) {
    // --- Tweet
    var tweet = "体重=" + json.root.weight + "kg 体脂肪率=" + json.root.bodyfat + "% BMI=" + json.root.bmi;
    Logger.log(tweet);
    postTweet(tweet, b64graph);
  
  // --- fitbit
    postWeightAndFat(json.root.weight, json.root.bodyfat);
  }
}