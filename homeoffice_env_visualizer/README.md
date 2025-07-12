# 自宅オフィスの環境可視化ツール

このGoogle Apps Scriptプロジェクトは、[ambidata.io](https://ambidata.io/) から温湿度・気圧データを取得し、Googleスプレッドシートにグラフとして可視化します。

## ✨ 主な機能

-   指定したambidata.ioチャンネルから日々の環境データを取得します。
-   日々のデータごとにGoogleスプレッドシートに新しいシートを作成します。
-   気温・湿度、および気圧の折れ線グラフを自動で生成します。
-   日ごとの平均値を計算し、「TOTAL」シートに記録します。

## 🚀 使い方

### 1. ambidata.ioチャンネルの準備

-   温湿度・気圧データを収集するチャンネルをambidata.ioで作成してください。
-   データは以下のようにマッピングされている必要があります。
    -   `d1`: 気温 (Temperature)
    -   `d2`: 湿度 (Humidity)
    -   `d3`: 気圧 (Barometric pressure)

### 2. スクリプトの設定

-   `src/main.ts` ファイルを開きます。
-   `main()` 関数内の以下の変数を設定してください。
    -   `SHEET_ID`: データを可視化したいGoogleスプレッドシートのID
    -   `AMBIDATA_CHANNEL_ID`: あなたのambidata.ioチャンネルID
    -   `AMBIDATA_READ_KEY`: あなたのambidata.io読み取りキー

### 3. スクリプトの実行

-   Google Apps Scriptプロジェクトで `main` 関数に対して毎日実行するトリガーを設定すると、毎日自動でデータを取得し可視化できます。

## 🛠️ 開発者向け情報

このプロジェクトは `clasp` を使用してローカルで開発されています。

### 必要なツール

-   [Node.js](https://nodejs.org/)
-   [clasp](https://github.com/google/clasp) (Google Apps ScriptのCLIツール)

### セットアップ手順

1.  **リポジトリをクローン:**
    ```bash
    git clone https://github.com/tahosook/gas_projects.git
    cd gas_projects/homeoffice_env_visualizer
    ```

2.  **claspでログイン:**
    ```bash
    clasp login
    ```

3.  **Google Apps Scriptプロジェクトの作成:**
    ```bash
    # 新しいプロジェクトを作成する場合
    clasp create --type standalone --title "Home Office Environment Visualizer"

    # 既存のプロジェクトに紐付ける場合
    # clasp clone <scriptId>
    ```
    これにより、`.clasp.json` ファイルが生成されます。

4.  **依存関係のインストール:**
    このプロジェクトは特定のnpmパッケージに依存していませんが、TypeScriptの型定義などを利用するために`@types/google-apps-script`が必要です。
    ```bash
    npm install
    ```

5.  **コードのデプロイ:**
    ローカルでの変更をGoogle Apps Scriptプロジェクトに反映させます。
    ```bash
    clasp push
    ```

## 📜 関数一覧

### `main.ts`

-   `main()`: データ取得からシート作成までの一連の処理を管理するメイン関数です。

### `util.ts`

-   `getYesterday()`: 前日の日付を `yyyy-MM-dd` 形式で返します。
-   `getAmbidataJson(channelId, readKey, date)`: ambidata.io APIからデータを取得します。
-   `createNewSheet(sheetId, sheetName, json)`: 新しいシートを作成し、データを入力、グラフを生成し、サマリーシートを更新します。
