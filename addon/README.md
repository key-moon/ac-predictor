# addon

## ビルド

```
pnpm install
pnpm bundle
```

## 開発

ビルドされたファイルから読み込む
```js
// ==UserScript==
// @name        ac-predictor-dev
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     0.0.0
// @author      keymoon
// @license     MIT
// @require     file:///path/to/ac-predictor/addon/dist/userscript/dist.js
// @match       https://atcoder.jp/*
// @exclude     https://atcoder.jp/*/json
// ==/UserScript==
```
