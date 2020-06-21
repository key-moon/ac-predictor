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

var dataURL = "https://data.ac-predictor.com";
var apiURL = "https://ac-predictor-backend.azurewebsites.net";
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
                case 0: return [4 /*yield*/, fetch(apiURL + ("/standings/" + contestScreenName + ".json"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getContestsAsync() {
    return __awaiter(this, void 0, Promise, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(dataURL + "/contests.json")];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
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
var colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];
function getColor(rating) {
    var colorIndex = 0;
    if (rating > 0) {
        colorIndex = Math.min(Math.floor(rating / 400) + 1, 8);
    }
    return colors[colorIndex];
}

function GetRowHTML(row) {
    function getRatingSpan(rate) {
        if (rate === null)
            return '<span class="bold">?</span>';
        return "<span class=\"bold user-" + getColor(rate) + "\">" + rate + "</span>";
    }
    function getRatingChangeStr(oldRate, newRate) {
        var delta = newRate - oldRate;
        var ratingChangeSpan = oldRate === null || newRate === null
            ? '<span class="gray">(?)'
            : "<span class=\"gray\">(" + (0 <= delta ? "+" : "") + delta + ")</span>";
        return getRatingSpan(oldRate) + " \u2192 " + getRatingSpan(newRate) + ratingChangeSpan;
    }
    var oldRating = row.oldRating !== null ? Math.round(row.oldRating) : null;
    var newRating = row.newRating !== null ? Math.round(row.newRating) : null;
    var performance = row.performance !== null ? Math.round(row.performance) : null;
    var unratedStr = getRatingSpan(oldRating) + "<span class=\"gray\">(unrated)</span>";
    var rankCell = "<td>" + row.rank + "</td>";
    var href = "http://atcoder.jp/users/" + row.userScreenName;
    var userCell = "<td><a class=\"user-" + getColor(oldRating) + "\" href=" + href + ">" + row.userScreenName + "</a></td>";
    var perfCell = "<td>" + getRatingSpan(performance) + "</td>";
    var rateChangeCell = "<td>" + (row.isRated ? getRatingChangeStr(oldRating, newRating) : unratedStr) + "</td>";
    return "<tr>" + rankCell + userCell + perfCell + rateChangeCell + "</tr>";
}
var ResultFixedRow = /** @class */ (function () {
    function ResultFixedRow(perfCalculator, internalRank, rank, userScreenName, isRated, oldRating, newRating) {
        this.perfCalculator = perfCalculator;
        this.internalRank = internalRank;
        this.rank = rank;
        this.userScreenName = userScreenName;
        this.isRated = isRated;
        this.oldRating = oldRating;
        this.newRating = newRating;
    }
    Object.defineProperty(ResultFixedRow.prototype, "performance", {
        get: function () {
            return this.perfCalculator.getPerformance(this.internalRank - 0.5);
        },
        enumerable: false,
        configurable: true
    });
    return ResultFixedRow;
}());
var OndemandRow = /** @class */ (function () {
    function OndemandRow(perfCalculator, ratedMatches, internalRank, rank, userScreenName, isRated, oldRating) {
        this.perfCalculator = perfCalculator;
        this.ratedMatches = ratedMatches;
        this.internalRank = internalRank;
        this.rank = rank;
        this.userScreenName = userScreenName;
        this.isRated = isRated;
        this.oldRating = oldRating;
    }
    Object.defineProperty(OndemandRow.prototype, "newRating", {
        get: function () {
            return calcRatingFromLast(this.oldRating, this.performance, this.ratedMatches);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OndemandRow.prototype, "performance", {
        get: function () {
            return this.perfCalculator.getPerformance(this.internalRank - 0.5);
        },
        enumerable: false,
        configurable: true
    });
    return OndemandRow;
}());
var Table = /** @class */ (function () {
    function Table(body, rowsPerPage) {
        if (rowsPerPage === void 0) { rowsPerPage = 20; }
        this.rows = [];
        this.page = 0;
        this.body = body;
        this.rows = [];
        this.rowsPerPage = rowsPerPage;
        this.setPage(0);
    }
    Table.prototype.draw = function () {
        var _this = this;
        this.body.innerHTML = "";
        var start = this.rowsPerPage * this.page;
        this.rows.slice(start, start + this.rowsPerPage).forEach(function (e) {
            _this.body.insertAdjacentHTML("beforeend", GetRowHTML(e));
        });
    };
    Table.prototype.setPage = function (page) {
        this.page = page;
        this.draw();
    };
    Table.prototype.highlight = function (index) {
        this.setPage(Math.floor(index / this.rowsPerPage));
        var ind = index % this.rowsPerPage;
        var elem = this.body.children[ind];
        elem.setAttribute("style", "border: 3px solid rgb(221, 40, 154);");
    };
    return Table;
}());
function getRow(fixed, internalRank, performanceCalculator, standingData) {
    if (fixed) {
        return new ResultFixedRow(performanceCalculator, internalRank, standingData.Rank, standingData.UserScreenName, standingData.IsRated, standingData.OldRating, null);
    }
    else {
        return new OndemandRow(performanceCalculator, standingData.Competitions, internalRank, standingData.Rank, standingData.UserScreenName, standingData.IsRated, standingData.Rating);
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
var PreCalcedPerformanceCalculator = /** @class */ (function () {
    function PreCalcedPerformanceCalculator() {
        this.maxPerf = Infinity;
        this.aperfs = [];
        this.caches = {};
    }
    PreCalcedPerformanceCalculator.prototype.addAPerfs = function (aperfs) {
        for (var cache in this.caches) {
            this.caches[cache] += calcRankVal(Number(cache), aperfs);
        }
        this.aperfs = this.aperfs.concat(aperfs);
    };
    PreCalcedPerformanceCalculator.prototype.getRank = function (perf) {
        if (typeof this.caches[perf] === "undefined")
            this.caches[perf] = calcRankVal(perf, this.aperfs);
        return this.caches[perf];
    };
    PreCalcedPerformanceCalculator.prototype.getPerformance = function (rank) {
        var large = 8192.5;
        var small = -8191.5;
        while (large - small > 1) {
            var mid = (large + small) / 2;
            if (rank > this.getRank(mid))
                large = mid;
            else
                small = mid;
        }
        return Math.min(Math.round((large + small) / 2), this.maxPerf);
    };
    return PreCalcedPerformanceCalculator;
}());

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
function getRatedLimit(contestScreenName) {
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
    var ratedLimit = maxDic.filter(function (x) { return x.pattern.exec(contestScreenName); })[0].maxPerf;
    return ratedLimit;
}
function getDefaultPerf(ratedLimit) {
    var defaulPerfDic = {
        1200: 800,
        2000: 800,
        2800: 1000,
        Infinity: 1200
    };
    return defaulPerfDic[ratedLimit];
}
var contests = {};
var currentTable;
function DrawTable(contestScreenName, drawUnrated) {
    return __awaiter(this, void 0, Promise, function () {
        function isRated(standingData) {
            var rate = standings.Fixed ? standingData.OldRating : standingData.Rating;
            return standingData.IsRated || (ratedLowerBound <= rate && rate < ratedUpperBound);
        }
        function addRow() {
            var fixRank = ratedRank + Math.max(0, ratedCount - 1) / 2;
            tiedList.forEach(function (standingsData) {
                table.rows.push(getRow(standings.Fixed, fixRank, calculator, standingsData));
            });
        }
        var tableDom, table, calculator, addedSet, value, aperfs, standings, officialResultLink, userScreptInstallLink, warningStr, div, newAPerfs, ratedUpperBound, ratedLowerBound, defaultAPerf, tiedList, ratedRank, lastRank, ratedCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tableDom = document.getElementById("standings-body");
                    if (tableDom === null)
                        throw new DOMException("#standings-body does not found");
                    if (typeof contests[contestScreenName] === "undefined")
                        contests[contestScreenName] = {
                            table: new Table(tableDom),
                            calculator: new PreCalcedPerformanceCalculator(),
                            addedSet: new Set()
                        };
                    table = contests[contestScreenName].table;
                    calculator = contests[contestScreenName].calculator;
                    addedSet = contests[contestScreenName].addedSet;
                    currentTable = table;
                    return [4 /*yield*/, Promise.all([getAPerfsAsync(contestScreenName), getStandingsAsync(contestScreenName)])];
                case 1:
                    value = _a.sent();
                    aperfs = value[0];
                    standings = value[1];
                    if (standings.Fixed) {
                        officialResultLink = "<a href=https://atcoder.jp/contests/" + contestScreenName + "/results>\u516C\u5F0F\u306E\u767A\u8868</a>";
                        userScreptInstallLink = "<a href=/userscript>UserScript</a>";
                        warningStr = "\u30B3\u30F3\u30C6\u30B9\u30C8\u7D50\u679C\u304C\u78BA\u5B9A\u3057\u3066\u3044\u308B\u305F\u3081\u3001\u30EC\u30FC\u30C6\u30A3\u30F3\u30B0\u5909\u5316\u3092\u6B63\u78BA\u306B\u8A08\u7B97\u3067\u304D\u307E\u305B\u3093\u3002\u6B63\u78BA\u306A\u7D50\u679C\u306F\u3001" + officialResultLink + "\u307E\u305F\u306F" + userScreptInstallLink + "\u306B\u3066\u3054\u78BA\u8A8D\u4E0B\u3055\u3044\u3002";
                        div = "<div class=\"alert alert-info\" role=\"alert\">" + warningStr + "</div>";
                        table.body.parentElement.insertAdjacentHTML("beforebegin", div);
                    }
                    newAPerfs = [];
                    ratedUpperBound = getRatedLimit(contestScreenName);
                    ratedLowerBound = ratedUpperBound === Infinity ? 1200 : 0;
                    defaultAPerf = getDefaultPerf(ratedUpperBound);
                    calculator.maxPerf = ratedUpperBound + 400;
                    standings.StandingsData.forEach(function (element) {
                        var _a;
                        var userScreenName = element.UserScreenName;
                        var isUnrated = element.UserIsDeleted ||
                            !isRated(element) ||
                            element.TotalResult.Count === 0 ||
                            addedSet.has(userScreenName);
                        if (isUnrated)
                            return;
                        addedSet.add(userScreenName);
                        newAPerfs.push((_a = aperfs[userScreenName]) !== null && _a !== void 0 ? _a : defaultAPerf);
                    });
                    calculator.addAPerfs(newAPerfs);
                    tiedList = [];
                    ratedRank = 1;
                    lastRank = 0;
                    ratedCount = 0;
                    table.rows.length = 0;
                    standings.StandingsData.forEach(function (element) {
                        if ((!drawUnrated && !element.IsRated) || element.TotalResult.Count === 0)
                            return;
                        if (lastRank !== element.Rank) {
                            addRow();
                            tiedList.length = 0;
                            ratedRank += ratedCount;
                            ratedCount = 0;
                        }
                        tiedList.push(element);
                        lastRank = element.Rank;
                        if (isRated(element))
                            ratedCount++;
                    });
                    addRow();
                    table.draw();
                    return [2 /*return*/];
            }
        });
    });
}
function searchUser() {
    function setAlert(val) {
        $("#username-search-input").addClass("is-invalid");
        $("#username-search-alert").text(val);
    }
    function clearAlert() {
        $("#username-search-input").removeClass("is-invalid");
        $("#username-search-alert").empty();
    }
    clearAlert();
    var targetUserScreenName = $("#username-search-input").val();
    if (targetUserScreenName === "") {
        setAlert("ユーザー名を入力してください");
        return;
    }
    var index = currentTable.rows.findIndex(function (row) { return row.userScreenName === targetUserScreenName; });
    if (index === -1) {
        setAlert("ユーザー名が見つかりませんでした");
        return;
    }
    currentTable.highlight(index);
}
$(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                $("#show-unrated-description").tooltip();
                //ユーザー名検索
                document.getElementById("username-search-button").onclick = searchUser;
                document.getElementById("username-search-input").onkeypress = function (pressedKey) {
                    if (pressedKey.which === 13)
                        searchUser();
                };
                $("#confirm-btn").click(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var contestScreenName, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                contestScreenName = $("#contest-selector").val();
                                if (typeof contestScreenName === "undefined")
                                    return [2 /*return*/];
                                toggleLoadingState();
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, DrawTable(String(contestScreenName), $("#show-unrated").prop("checked")).then(function () {
                                        toggleLoadingState();
                                    })];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _a.sent();
                                toggleLoadingState();
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                _a = setItemToSelector;
                return [4 /*yield*/, getContestsAsync()];
            case 1:
                _a.apply(void 0, [_b.sent()]);
                return [2 /*return*/];
        }
    });
}); });
