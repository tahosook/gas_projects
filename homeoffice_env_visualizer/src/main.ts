declare const global: any;
import { createNewSheet, getAmbidataJson, getYesterday } from "./util";

// main関数を定義
function main(): void {
  const scriptProperties = PropertiesService.getScriptProperties();
  const SHEET_ID = scriptProperties.getProperty("SHEET_ID");
  const AMBIDATA_CHANNEL_ID =
    scriptProperties.getProperty("AMBIDATA_CHANNEL_ID"); // チャンネルID
  const AMBIDATA_READ_KEY = scriptProperties.getProperty("AMBIDATA_READ_KEY"); // 読み取りキー

  if (!SHEET_ID || !AMBIDATA_CHANNEL_ID || !AMBIDATA_READ_KEY) {
    throw new Error("スクリプトプロパティが設定されていません。");
  }

  var yesterday = getYesterday();

  var json = getAmbidataJson(
    AMBIDATA_CHANNEL_ID, // チャンネルID
    AMBIDATA_READ_KEY, // 読み取りキー
    yesterday // 日付
  );

  createNewSheet(SHEET_ID, yesterday, json);
}

// main関数をグローバルに公開する
global.main = main;