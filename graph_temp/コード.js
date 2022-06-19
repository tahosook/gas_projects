var SHEET_ID = "1XLHMUy269MObb6EPk6dzqYJrzYDVCId6BPAG8VV538U";

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

// media upload
function postTweetMediaUpload(chart) {
  var service = twitter.getService();
  var mediaUpload = 'https://upload.twitter.com/1.1/media/upload.json';

  var graph = Utilities.base64Encode(chart.getBlob().getBytes());
  var img_option = {
    'method': "POST",
    'payload': { 'media_data': graph }
  };

  var image_upload = JSON.parse(service.fetch(mediaUpload, img_option));

  return image_upload['media_id_string'];
}

// ツイートを投稿
function postTweet(status, chart1, chart2) {
  var service = twitter.getService();
  var statusUpdate = 'https://api.twitter.com/1.1/statuses/update.json';

  var mediaIdStr1 = postTweetMediaUpload(chart1);
  var mediaIdStr2 = postTweetMediaUpload(chart2);
  var response = service.fetch(statusUpdate, {
    method: 'post',
    payload: {
      status: status,
      'media_ids': mediaIdStr1 + "," + mediaIdStr2,
    }
  });
}

function getYesterday() {
  // 昨日を取得
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  var date = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy-MM-dd');

  Logger.log(date);
  return date;
}

//=================================== MAIN
function myFunction() {
  var yesterday = getYesterday();
  //  yesterday = "2021-09-06";
  var url = "https://ambidata.io/api/v2/channels/1140/data?readKey=f6ef7a046e8aee0a&date=" + yesterday;
  var options = {
    "method": "GET",
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response);

  // IDからスプレッドシートを取得
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  // 最初のシートを取得
  //  var sheet = spreadsheet.getSheets()[0];
  // シートを新規作成
  var sheet = spreadsheet.insertSheet();

  var values = [];
  var MAXROW = 5000000 / 4;
  var rowcount = json.length > MAXROW ? MAXROW : json.length;
  for (var i = 0; i < rowcount; i++) {
    var jst = Utilities.formatDate(new Date(json[i].created), "JST", "yyyy-MM-dd HH:mm:ss");
    var temp = json[i].d1;
    var humi = json[i].d2;
    var bpre = json[i].d3;
    values.push([jst, temp, humi, bpre]);
  }
  Logger.log("%s,%s,%s,%s,%s", sheet.getLastRow() + 1, 1, values.length, values[0].length, json.length);

  // シートにデータ登録
  var STR_C1 = "Date";
  var STR_C2 = "Temperature";
  var STR_C3 = "Humidity";
  var STR_C4 = "Barometric pressure";
  sheet.appendRow([STR_C1, STR_C2, STR_C3, STR_C4, "", "", STR_C2, STR_C3, STR_C4]);
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
  var STR_values = [["Average", "=AVERAGE(B2:B290)", "=AVERAGE(C2:C290)", "=AVERAGE(D2:D290)"], ["Min", "=MIN(B2:B290)", "=MIN(C2:C290)", "=MIN(D2:D290)"]];
  sheet.getRange(2, 6, STR_values.length, STR_values[0].length).setValues(STR_values);

  var avgValues = [sheet.getRange(2, 7).getValue(), sheet.getRange(2, 8).getValue(), sheet.getRange(2, 9).getValue()];
  Logger.log("Avg: tmp: %s,hum: %s, bp: %s", avgValues[0], avgValues[1], avgValues[2]);

  var minValues = [sheet.getRange(3, 7).getValue(), sheet.getRange(3, 8).getValue(), sheet.getRange(3, 9).getValue()];
  Logger.log("Min: tmp: %s,hum: %s, bp: %s", minValues[0], minValues[1], minValues[2]);

  //グラフ作成(気温湿度)
  var range1 = sheet.getRange("A1:C291");
  var chart1 = sheet.newChart()
    .addRange(range1)
    .setPosition(5, 5, 0, 0)
    .setChartType(Charts.ChartType.LINE)
    .setOption('series', {
      0: { labelInLegend: STR_C2 },
      1: { labelInLegend: STR_C3, targetAxisIndex: 1 }
    })
    .setOption("vAxes", [
      { title: STR_C2, viewWindow: { min: minValues[0] } },
      { title: STR_C3, viewWindow: { min: minValues[1] } }])
    .build();
  sheet.insertChart(chart1);

  //グラフ作成(気圧)
  var chart2 = sheet.newChart()
    .addRange(sheet.getRange("A1:A291"))
    .addRange(sheet.getRange("D1:D291"))
    .setPosition(23, 5, 0, 0)
    .setChartType(Charts.ChartType.LINE)
    .setOption('series', { 0: { labelInLegend: STR_C4, color: "gold" } })
    .setOption("vAxes", [
      { title: STR_C4, viewWindow: { min: minValues[2] } }])
    .build();
  sheet.insertChart(chart2);

  // シートの名前変更  
  //  var formatDate = Utilities.formatDate(new Date(), "JST","yyyyMMdd");
  //  sheet.setName(formatDate);
  sheet.setName(yesterday);

  // 日時のシート作成
  var sheetTotal = spreadsheet.getSheetByName("TOTAL");
  sheetTotal.insertRowAfter(1);
  sheetTotal.getRange(2, 1, 1, 4).setValues([[yesterday, avgValues[0], avgValues[1], avgValues[2]]]);

  // Twitter
  var tweet = Utilities.formatString("気温=%4.1f℃ 湿度=%4.1f% 気圧=%4.1fhPa %s",
    avgValues[0], avgValues[1], avgValues[2],
    "https://ambidata.io/ch/channel.html?id=1140");
  Logger.log(tweet);
  postTweet(tweet, chart1, chart2);
}
