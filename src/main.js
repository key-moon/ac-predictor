// ==UserScript==
// @name        ac-predictor
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     1.2.4
// @description コンテスト中にAtCoderのパフォーマンスを予測します
// @author      keymoon
// @license     MIT
// @require     https://greasyfork.org/scripts/386715-atcoder-sidemenu/code/atcoder-sidemenu.js
// @require     https://greasyfork.org/scripts/386712-atcoder-userscript-libs/code/atcoder-userscript-libs.js
// @supportURL  https://github.com/key-moon/ac-predictor.user.js/issues
// @match       https://atcoder.jp/*
// @exclude     https://atcoder.jp/*/json
// ==/UserScript==

import {initializeID} from './libs/tabID';
import {sidemenu} from "atcoder-sidemenu";
import {predictor} from "./elements/predictor/script";
import {estimator} from "./elements/estimator/script";

initializeID();
sidemenu.addElement(predictor);
sidemenu.addElement(estimator);