import { unpositivizeRating, positivizeRating, calcRatingFromLast, getColor } from "./rating";

const dataURL = "http://data.ac-predictor.com";
const apiURL = "http://ac-predictor.azurewebsites.com";

async function getAPerfsAsync(contestScreenName: string): Promise<{ [key: string]: number }> {
    const response = await fetch(dataURL + `/aperfs/${contestScreenName}.json`);
    return await response.json();
}

async function getStandingsAsync(contestScreenName: string): Promise<Standings> {
    const response = await fetch(apiURL + `/api/standings/${contestScreenName}.json`);
    return await response.json();
}

function setItemToSelector(items: string[]): void {
    const selected = $("#contest-selector").val();
    $("#contest-selector").empty();
    items.forEach(item => {
        $("#contest-selector").append(`<option>${item}</option>`);
    });
    if (typeof selected === "undefined") return;
    $("#contest-selector").val(selected);
}

let state = 0;
function toggleLoadingState(): void {
    if (state === 0) {
        state = 1;
        $("#confirm-btn").text("読み込み中");
        $("#confirm-btn").prop("disabled", true);
    } else {
        state = 0;
        $("#confirm-btn").text("確定");
        $("#confirm-btn").prop("disabled", false);
    }
}

// O(m)
function calcRankVal(X: number, aPerfs: number[]): number {
    let res = 0;
    aPerfs.forEach(function(aperf) {
        res += 1.0 / (1.0 + Math.pow(6.0, (X - aperf) / 400.0));
    });
    return res;
}

// O(mlogR) (二分探索)
function getPerf(rank: number, aPerfs: number[]): number {
    let upper = 8192;
    let lower = -8192;

    while (upper - lower > 0.5) {
        if (rank - 0.5 > calcRankVal(lower + (upper - lower) / 2, aPerfs)) upper -= (upper - lower) / 2;
        else lower += (upper - lower) / 2;
    }

    return lower + (upper - lower) / 2;
}

async function DrawTable(contestScrenName: string): Promise<void> {
    //O(n + mR)
    //n := サブミットした人数(2500人くらい ?)
    //m := Ratedな人(これも2500人)
    //R := レートの幅(4000くらい)
    function draw(standings: Standings, aperfs: { [key: string]: number }, drawUnrated: boolean): void {
        //テーブルをクリア
        const table = $("#standings-body");
        table.empty();

        const maxDic = [
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
        const activePerf: number[] = [];
        let isAnyoneRated = false;
        const ratedLimit = maxDic.filter(x => x.pattern.exec(contestScrenName))[0].maxPerf as number;
        const defaulPerfDic: { [key: number]: number } = {
            1200: 800,
            2000: 800,
            2800: 1000,
            Infinity: 1200
        };
        const defaultAPerf = defaulPerfDic[ratedLimit];

        standings.StandingsData.forEach(function(element) {
            if (!element.IsRated || element.TotalResult.Count === 0) return;
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
            for (let i = 0; i < standings.StandingsData.length; i++) {
                const element = standings.StandingsData[i];
                if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0) continue;
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
        const maxPerf = ratedLimit === Infinity ? getPerf(1, activePerf) : ratedLimit + 400;

        //addRowを回すときのパフォ 0.5を引いているのは四捨五入が発生する境界に置くため
        let currentPerf = maxPerf - 0.5;
        let rankVal = calcRankVal(currentPerf, activePerf);

        //タイの人を入れる(順位が変わったら描画→リストを空に)
        let tiedList: StandingData[] = [];
        let rank = 1;
        let lastRank = 0;
        let ratedCount = 0;

        //タイリストの人全員行追加
        function addRow(): void {
            const fixRank = rank + Math.max(0, ratedCount - 1) / 2;
            while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
                currentPerf--;
                rankVal = calcRankVal(currentPerf, activePerf);
            }
            const perf = currentPerf + 0.5;
            tiedList.forEach(function(element): void {
                function getRatingChangeStr(oldRate: number, newRate: number): string {
                    function ratingSpan(rate: number): string {
                        return `<span class="user-${getColor(rate)}">${rate}</span>`;
                    }

                    return element.IsRated
                        ? `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)}(${newRate >= oldRate ? "+" : ""}${newRate -
                              oldRate})`
                        : `${ratingSpan(oldRate)}(unrated)`;
                }

                const matches = element.Competitions - (standings.Fixed && element.IsRated ? 1 : 0);
                const oldRate = standings.Fixed ? element.OldRating : element.Rating;
                const newRate = Math.floor(
                    positivizeRating(
                        matches !== 0 ? calcRatingFromLast(unpositivizeRating(oldRate), perf, matches) : perf - 1200
                    )
                );
                const name = element.UserScreenName;
                const node = `<tr><td>${rank}</td><td><a class="user-${getColor(
                    oldRate
                )}" href=http://atcoder.jp/users/${name} >${name}</a></td><td>${perf}</td><td>${getRatingChangeStr(
                    oldRate,
                    newRate
                )}</td></tr>`;
                table.append(node);
            });
        }
        //全員回す
        standings.StandingsData.forEach(function(element) {
            if ((!drawUnrated && !element.IsRated) || element.TotalResult.Count === 0) return;
            if (lastRank !== element.Rank) {
                addRow();
                rank += ratedCount;
                ratedCount = 0;
                tiedList = [];
            }
            tiedList.push(element);
            lastRank = element.Rank;
            if (element.IsRated) ratedCount++;
        });
        //最後に更新してあげる
        addRow();
    }

    await Promise.all([getAPerfsAsync(contestScrenName), getStandingsAsync(contestScrenName)]).then(value => {
        const aperfs = value[0] as { [key: string]: number };
        const standings = value[1] as Standings;
        draw(standings, aperfs, $("#show-unrated").prop("checked"));
    });
}

$(async () => {
    $("#show-unrated-description").tooltip();

    //ユーザー名検索
    $("#username-search-button").click(() => {
        function setAlert(val: string): void {
            $("#username-search-input").addClass("is-invalid");
            $("#username-search-alert").text(val);
        }
        function clearAlert(): void {
            $("#username-search-input").removeClass("is-invalid");
            $("#username-search-alert").empty();
        }

        clearAlert();
        const searchName = $("#username-search-input").val();
        if (searchName === "") {
            setAlert("ユーザー名を入力してください");
            return;
        }

        let found = false;
        $("#standings-body a[class^=user]").each((_, elem) => {
            const elemDom = $(elem);
            if (found || elemDom.text() === searchName) return;
            // 現在の枠線を削除
            $("#standings-body > tr").css("border", "none");
            // 枠線をつける
            elemDom
                .parent()
                .parent()
                .css("border", "solid 3px #dd289a");
            // スクロール
            const offset = elemDom.offset();
            const height = $(window).height();
            if (typeof offset === "undefined" || typeof height === "undefined") return;
            $("html,body").animate({
                scrollTop: offset.top - height / 2
            });
            found = true;
        });

        if (!found) {
            setAlert("ユーザー名が見つかりませんでした");
        }
    });
    $("#username-search-input").keypress(pressedKey => {
        if (pressedKey.which === 13) {
            //エンターキー
            $("#username-search-button").click();
        }
    });

    $("#confirm-btn").click(() => {
        const contestScreenName = $("#contest-selector").val();
        if (typeof contestScreenName === "undefined") return;
        toggleLoadingState();
        DrawTable(String(contestScreenName)).then(() => {
            toggleLoadingState();
        });
    });

    setItemToSelector(await (await fetch(dataURL + "/contests.json")).json());
});
