// ==UserScript==
// @name        ac-predictor
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     1.2.4
// @description コンテスト中にAtCoderのパフォーマンスを予測します
// @author      keymoon
// @license     MIT
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