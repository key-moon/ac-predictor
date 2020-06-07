/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function bigf(n) {
    var numerator = 1.0;
    var denominator = 1.0;
    for (var i = 0; i < n; ++i) {
        numerator *= 0.81;
        denominator *= 0.9;
    }
    numerator = ((1 - numerator) * 0.81) / 0.19;
    denominator = ((1 - denominator) * 0.9) / 0.1;
    return Math.sqrt(numerator) / denominator;
}
var finf = bigf(400);
function f(n) {
    return ((bigf(n) - finf) / (bigf(1) - finf)) * 1200.0;
}
/**
 * calculate unpositivized rating from last state
 * @param {number} [last] last unpositivized rating
 * @param {number} [perf] performance
 * @param {number} [ratedMatches] count of participated rated contest
 * @returns {number} estimated unpositivized rating
 */
function calcRatingFromLast(last, perf, ratedMatches) {
    if (ratedMatches === 0)
        return perf - 1200;
    last += f(ratedMatches);
    var weight = 9 - 9 * Math.pow(0.9, ratedMatches);
    var numerator = weight * Math.pow(2, (last / 800.0)) + Math.pow(2, (perf / 800.0));
    var denominator = 1 + weight;
    return Math.log(numerator / denominator) * Math.LOG2E * 800.0 - f(ratedMatches + 1);
}
/**
 * (-inf, inf) -> (0, inf)
 * @param {number} [rating] unpositivized rating
 * @returns {number} positivized rating
 */
function positivizeRating(rating) {
    if (rating >= 400.0) {
        return rating;
    }
    return 400.0 * Math.exp((rating - 400.0) / 400.0);
}
/**
 * (0, inf) -> (-inf, inf)
 * @param {number} [rating] positivized rating
 * @returns {number} unpositivized rating
 */
function unpositivizeRating(rating) {
    if (rating >= 400.0) {
        return rating;
    }
    return 400.0 + 400.0 * Math.log(rating / 400.0);
}
var colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];
function getColor(rating) {
    var colorIndex = 0;
    if (rating > 0) {
        colorIndex = Math.min(Math.floor(rating / 400) + 1, 8);
    }
    return colors[colorIndex];
}

var dataURL = "https://data.ac-predictor.com";
var apiURL = "https://ac-predictor.azurewebsites.com";
function getAPerfsAsync(contestScreenName) {
    return __awaiter(this, void 0, Promise, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(dataURL + ("/aperfs/" + contestScreenName + ".json"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getStandingsAsync(contestScreenName) {
    return __awaiter(this, void 0, Promise, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(apiURL + ("/api/standings/" + contestScreenName + ".json"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function setItemToSelector(items) {
    var selected = $("#contest-selector").val();
    $("#contest-selector").empty();
    items.forEach(function (item) {
        $("#contest-selector").append("<option>" + item + "</option>");
    });
    if (typeof selected === "undefined")
        return;
    $("#contest-selector").val(selected);
}
var state = 0;
function toggleLoadingState() {
    if (state === 0) {
        state = 1;
        $("#confirm-btn").text("読み込み中");
        $("#confirm-btn").prop("disabled", true);
    }
    else {
        state = 0;
        $("#confirm-btn").text("確定");
        $("#confirm-btn").prop("disabled", false);
    }
}
// O(m)
function calcRankVal(X, aPerfs) {
    var res = 0;
    aPerfs.forEach(function (aperf) {
        res += 1.0 / (1.0 + Math.pow(6.0, (X - aperf) / 400.0));
    });
    return res;
}
// O(mlogR) (二分探索)
function getPerf(rank, aPerfs) {
    var upper = 8192;
    var lower = -8192;
    while (upper - lower > 0.5) {
        if (rank - 0.5 > calcRankVal(lower + (upper - lower) / 2, aPerfs))
            upper -= (upper - lower) / 2;
        else
            lower += (upper - lower) / 2;
    }
    return lower + (upper - lower) / 2;
}
function DrawTable(contestScrenName) {
    return __awaiter(this, void 0, Promise, function () {
        //O(n + mR)
        //n := サブミットした人数(2500人くらい ?)
        //m := Ratedな人(これも2500人)
        //R := レートの幅(4000くらい)
        function draw(standings, aperfs, drawUnrated) {
            //テーブルをクリア
            var table = $("#standings-body");
            table.empty();
            var maxDic = [
                { pattern: /^abc12[6-9]$/, maxPerf: 2000 },
                { pattern: /^abc1[3-9]\d$/, maxPerf: 2000 },
                { pattern: /^abc\d{3}$/, maxPerf: 1200 },
                { pattern: /^arc\d{3}$/, maxPerf: 2800 },
                { pattern: /^agc\d{3}$/, maxPerf: Infinity },
                { pattern: /^apc\d{3}$/, maxPerf: Infinity },
                { pattern: /^cf\d{2}-final-open$/, maxPerf: Infinity },
                { pattern: /^soundhound2018-summer-qual$/, maxPerf: 2000 },
                { pattern: /^caddi2018$/, maxPerf: 1800 },
                { pattern: /^caddi2018b$/, maxPerf: 1200 },
                { pattern: /^aising2019$/, maxPerf: 2000 },
                { pattern: /^keyence2019$/, maxPerf: 2800 },
                { pattern: /^nikkei2019-qual$/, maxPerf: 2800 },
                { pattern: /^exawizards2019$/, maxPerf: 2800 },
                { pattern: /^diverta2019/, maxPerf: 2800 },
                { pattern: /^m-solutions2019$/, maxPerf: 2800 },
                { pattern: /.*/, maxPerf: Infinity }
            ];
            //Perf計算時に使うパフォ(Ratedオンリー)
            var activePerf = [];
            var isAnyoneRated = false;
            var ratedLimit = maxDic.filter(function (x) { return x.pattern.exec(contestScrenName); })[0].maxPerf;
            var defaulPerfDic = {
                1200: 800,
                2000: 800,
                2800: 1000,
                Infinity: 1200
            };
            var defaultAPerf = defaulPerfDic[ratedLimit];
            standings.StandingsData.forEach(function (element) {
                if (!element.IsRated || element.TotalResult.Count === 0)
                    return;
                if (!aperfs[element.UserScreenName]) {
                    //ここで何も追加しないと下限RatedValueが人数を下回ってしまい、こわれる
                    activePerf.push(defaultAPerf);
                    return;
                }
                isAnyoneRated = true;
                activePerf.push(aperfs[element.UserScreenName]);
            });
            //要するにUnRatedコン
            if (!isAnyoneRated) {
                //レーティングは変動しないので、コンテスト中と同じ扱いをして良い。
                standings.Fixed = false;
                //元はRatedだったと推測できる場合、通常のRatedと同じような扱い
                activePerf.length = 0;
                for (var i = 0; i < standings.StandingsData.length; i++) {
                    var element = standings.StandingsData[i];
                    if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0)
                        continue;
                    if (!aperfs[element.UserScreenName]) {
                        activePerf.push(defaultAPerf);
                        continue;
                    }
                    //Ratedフラグをオンに
                    standings.StandingsData[i].IsRated = true;
                    activePerf.push(aperfs[element.UserScreenName]);
                }
            }
            //限界パフォーマンス(上限なしの場合は一位の人のパフォ)
            var maxPerf = ratedLimit === Infinity ? getPerf(1, activePerf) : ratedLimit + 400;
            //addRowを回すときのパフォ 0.5を引いているのは四捨五入が発生する境界に置くため
            var currentPerf = maxPerf - 0.5;
            var rankVal = calcRankVal(currentPerf, activePerf);
            //タイの人を入れる(順位が変わったら描画→リストを空に)
            var tiedList = [];
            var rank = 1;
            var lastRank = 0;
            var ratedCount = 0;
            //タイリストの人全員行追加
            function addRow() {
                var fixRank = rank + Math.max(0, ratedCount - 1) / 2;
                while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
                    currentPerf--;
                    rankVal = calcRankVal(currentPerf, activePerf);
                }
                var perf = currentPerf + 0.5;
                tiedList.forEach(function (element) {
                    function getRatingChangeStr(oldRate, newRate) {
                        function ratingSpan(rate) {
                            return "<span class=\"user-" + getColor(rate) + "\">" + rate + "</span>";
                        }
                        return element.IsRated
                            ? ratingSpan(oldRate) + " -> " + ratingSpan(newRate) + "(" + (newRate >= oldRate ? "+" : "") + (newRate -
                                oldRate) + ")"
                            : ratingSpan(oldRate) + "(unrated)";
                    }
                    var matches = element.Competitions - (standings.Fixed && element.IsRated ? 1 : 0);
                    var oldRate = standings.Fixed ? element.OldRating : element.Rating;
                    var newRate = Math.floor(positivizeRating(matches !== 0 ? calcRatingFromLast(unpositivizeRating(oldRate), perf, matches) : perf - 1200));
                    var name = element.UserScreenName;
                    var node = "<tr><td>" + rank + "</td><td><a class=\"user-" + getColor(oldRate) + "\" href=http://atcoder.jp/users/" + name + " >" + name + "</a></td><td>" + perf + "</td><td>" + getRatingChangeStr(oldRate, newRate) + "</td></tr>";
                    table.append(node);
                });
            }
            //全員回す
            standings.StandingsData.forEach(function (element) {
                if ((!drawUnrated && !element.IsRated) || element.TotalResult.Count === 0)
                    return;
                if (lastRank !== element.Rank) {
                    addRow();
                    rank += ratedCount;
                    ratedCount = 0;
                    tiedList = [];
                }
                tiedList.push(element);
                lastRank = element.Rank;
                if (element.IsRated)
                    ratedCount++;
            });
            //最後に更新してあげる
            addRow();
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([getAPerfsAsync(contestScrenName), getStandingsAsync(contestScrenName)]).then(function (value) {
                        var aperfs = value[0];
                        var standings = value[1];
                        draw(standings, aperfs, $("#show-unrated").prop("checked"));
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                $("#show-unrated-description").tooltip();
                //ユーザー名検索
                $("#username-search-button").click(function () {
                    function setAlert(val) {
                        $("#username-search-input").addClass("is-invalid");
                        $("#username-search-alert").text(val);
                    }
                    function clearAlert() {
                        $("#username-search-input").removeClass("is-invalid");
                        $("#username-search-alert").empty();
                    }
                    clearAlert();
                    var searchName = $("#username-search-input").val();
                    if (searchName === "") {
                        setAlert("ユーザー名を入力してください");
                        return;
                    }
                    var found = false;
                    $("#standings-body a[class^=user]").each(function (_, elem) {
                        var elemDom = $(elem);
                        if (found || elemDom.text() === searchName)
                            return;
                        // 現在の枠線を削除
                        $("#standings-body > tr").css("border", "none");
                        // 枠線をつける
                        elemDom
                            .parent()
                            .parent()
                            .css("border", "solid 3px #dd289a");
                        // スクロール
                        var offset = elemDom.offset();
                        var height = $(window).height();
                        if (typeof offset === "undefined" || typeof height === "undefined")
                            return;
                        $("html,body").animate({
                            scrollTop: offset.top - height / 2
                        });
                        found = true;
                    });
                    if (!found) {
                        setAlert("ユーザー名が見つかりませんでした");
                    }
                });
                $("#username-search-input").keypress(function (pressedKey) {
                    if (pressedKey.which === 13) {
                        //エンターキー
                        $("#username-search-button").click();
                    }
                });
                $("#confirm-btn").click(function () {
                    var contestScreenName = $("#contest-selector").val();
                    if (typeof contestScreenName === "undefined")
                        return;
                    toggleLoadingState();
                    DrawTable(String(contestScreenName)).then(function () {
                        toggleLoadingState();
                    });
                });
                _a = setItemToSelector;
                return [4 /*yield*/, fetch(dataURL + "/contests.json")];
            case 1: return [4 /*yield*/, (_b.sent()).json()];
            case 2:
                _a.apply(void 0, [_b.sent()]);
                return [2 /*return*/];
        }
    });
}); });
