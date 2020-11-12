# 概要
ac-predictorのUserScript([ac-predictor](https://greasyfork.org/ja/scripts/369954-ac-predictor))の開発環境です。

# 貢献
プルリクエストはいつでも受け付けています!些細なバグ修正や機能追加等お待ちしています。

# 開発

## 環境構築
まず、`node.js`と`npm`をインストールしてください。
その後、`npm install`を`package.json`の存在するディレクトリ(=リポジトリのルートディレクトリ)上で実行することにより開発環境が構築できます。

## ビルド
バンドル(1ファイルに実行可能な形でまとめること)にはWebpackを使用しています。`npx webpack`コマンドを実行することで、`/dist/bundle.js`にバンドル済みJSが生成されます。

## AtCoder上での実行
生成済みJSはすでにUserScriptとして発行可能な形になっているため、既存のac-predictorを置き換えることでもAtCoder上でテストをすることが可能です。
しかし、一々ビルドの度にやるのは~~面倒くさい~~効率が悪いため、以下のようなUserScriptを作成してローカルから最新バンドルがロードされるようにすると便利です:
```JS
// ==UserScript==
// @name        ac-predictor-dev
// @namespace   https://atcoder.jp/
// @version     1.0.0
// @description 開発用のスクリプトです。ローカルからビルド済みスクリプトをロードします。
// @author      keymoon
// @license     MIT
// @require     https://greasyfork.org/scripts/386715-atcoder-sidemenu/code/atcoder-sidemenu.js
// @require     https://greasyfork.org/scripts/386712-atcoder-userscript-libs/code/atcoder-userscript-libs.js
// @require     file://[リポジトリの親ディレクトリへのパス]/ac-predictor.user.js/dist/bundle.js
// @supportURL  https://github.com/key-moon/ac-predictor.user.js/issues
// @run-at      document-end
// @match       https://atcoder.jp/*
// @exclude     https://atcoder.jp/*/json
// ==/UserScript==
```

通常のインストール済みスクリプトを無効にするのをお忘れなきように。

![](https://imgur.com/CpP1GYu.png)


# 謝辞
リポジトリ移行前に送られたため、現在ここでは見られないプルリクです([ツイート画面が2つ出てくる現象を修正](https://github.com/key-moon/ac-predictor/pull/1))。miozuneさん、ありがとうございます!
