// main関数をグローバルに公開する
function main() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Utility functions for the Home Office Environment Visualizer.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getYesterday = getYesterday;
exports.getAmbidataJson = getAmbidataJson;
exports.createNewSheet = createNewSheet;
// Returns the yesterday date in "yyyy-MM-dd" format.
function getYesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var date = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy-MM-dd');
    return date;
}
// Fetches JSON data from ambidata.io for a given channel and date.
function getAmbidataJson(channelId, readKey, date) {
    const url = `https://ambidata.io/api/v2/channels/${channelId}/data?readKey=${readKey}&date=${date}`;
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() !== 200) {
        throw new Error(`Failed to fetch data from ambidata.io: ${response.getContentText()}`);
    }
    return JSON.parse(response.getContentText());
}
// Creates a new sheet in the specified Google Spreadsheet and populates it with data from the provided JSON array.
function createNewSheet(sheetId, sheetName, json) {
    // IDからスプレッドシートを取得
    var spreadsheet = SpreadsheetApp.openById(sheetId);
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
    var minValues = [sheet.getRange(3, 7).getValue(), sheet.getRange(3, 8).getValue(), sheet.getRange(3, 9).getValue()];
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
        { title: STR_C3, viewWindow: { min: minValues[1] } }
    ])
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
        { title: STR_C4, viewWindow: { min: minValues[2] } }
    ])
        .build();
    sheet.insertChart(chart2);
    // シートの名前変更  
    sheet.setName(sheetName);
    // 日時のシート作成
    var sheetTotal = spreadsheet.getSheetByName("TOTAL");
    if (!sheetTotal) {
        sheetTotal = spreadsheet.insertSheet("TOTAL");
    }
    sheetTotal.insertRowAfter(1);
    sheetTotal.getRange(2, 1, 1, 4).setValues([[sheetName, avgValues[0], avgValues[1], avgValues[2]]]);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
// main関数を定義
function main() {
    var SHEET_ID = "115A9fS5N8dMXOZLusWEJg8wlH7FtOcYPHcBlscx-jk8";
    var AMBIDATA_CHANNEL_ID = "1140"; // チャンネルID
    var AMBIDATA_READ_KEY = "f6ef7a046e8aee0a"; // 読み取りキー
    var yesterday = (0, util_1.getYesterday)();
    var json = (0, util_1.getAmbidataJson)(AMBIDATA_CHANNEL_ID, // チャンネルID
    AMBIDATA_READ_KEY, // 読み取りキー
    yesterday // 日付
    );
    (0, util_1.createNewSheet)(SHEET_ID, yesterday, json);
}
// main関数をグローバルに公開する
__webpack_require__.g.main = main;

})();

/******/ })()
;