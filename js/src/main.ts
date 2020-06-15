import { getAPerfsAsync, getStandingsAsync, getContestsAsync } from "./api";
import { Table, getRow } from "./view/table";
import { PreCalcedPerformanceCalculator } from "./PerformanceCalculator";

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

function getMaxPerf(contestScreenName: string): number {
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
    const ratedLimit = maxDic.filter(x => x.pattern.exec(contestScreenName))[0].maxPerf as number;
    return ratedLimit;
}

function getDefaultPerf(ratedLimit: number): number {
    const defaulPerfDic: { [key: number]: number } = {
        1200: 800,
        2000: 800,
        2800: 1000,
        Infinity: 1200
    };
    return defaulPerfDic[ratedLimit];
}

const contests: {
    [key: string]: { table: Table; calculator: PreCalcedPerformanceCalculator; addedSet: Set<string> };
} = {};

let currentTable: Table;

async function DrawTable(contestScreenName: string, drawUnrated: boolean): Promise<void> {
    const tableDom = document.getElementById("standings-body");
    if (tableDom === null) throw new DOMException("#standings-body does not found");

    if (typeof contests[contestScreenName] === "undefined")
        contests[contestScreenName] = {
            table: new Table(tableDom),
            calculator: new PreCalcedPerformanceCalculator(),
            addedSet: new Set<string>()
        };

    const table = contests[contestScreenName].table;
    const calculator = contests[contestScreenName].calculator;
    const addedSet = contests[contestScreenName].addedSet;

    currentTable = table;

    const value = await Promise.all([getAPerfsAsync(contestScreenName), getStandingsAsync(contestScreenName)]);

    const aperfs = value[0];
    const standings = value[1];

    if (standings.Fixed) {
        const officialResultLink = `<a href=https://atcoder.jp/contests/${contestScreenName}/results>公式の発表</a>`;
        const userScreptInstallLink = "<a href=/userscript>UserScript</a>";
        const warningStr = `コンテスト結果が確定しているため、レーティング変化を正確に計算できません。正確な結果は、${officialResultLink}または${userScreptInstallLink}にてご確認下さい。`;
        const div = `<div class="alert alert-info" role="alert">${warningStr}</div>`;
        table.body.parentElement.insertAdjacentHTML("beforebegin", div);
    }

    const newAPerfs: number[] = [];
    const ratedLimit = getMaxPerf(contestScreenName);
    const defaultAPerf = getDefaultPerf(ratedLimit);
    calculator.maxPerf = ratedLimit;

    function isRated(standingData: StandingData): boolean {
        return standingData.IsRated || (standings.Fixed ? standingData.OldRating : standingData.Rating) < ratedLimit;
    }

    standings.StandingsData.forEach(function(element) {
        const userScreenName = element.UserScreenName;
        const isUnrated =
            element.UserIsDeleted ||
            isRated(element) ||
            element.TotalResult.Count === 0 ||
            addedSet.has(userScreenName);
        if (isUnrated) return;
        addedSet.add(userScreenName);
        newAPerfs.push(aperfs[userScreenName] ?? defaultAPerf);
    });
    calculator.addAPerfs(newAPerfs);

    const tiedList: StandingData[] = [];

    let ratedRank = 1;
    let lastRank = 0;
    let ratedCount = 0;

    table.rows.length = 0;

    function addRow(): void {
        const fixRank = ratedRank + Math.max(0, ratedCount - 1) / 2;
        tiedList.forEach(function(standingsData): void {
            table.rows.push(getRow(standings.Fixed, fixRank, calculator, standingsData));
        });
    }

    standings.StandingsData.forEach(function(element) {
        if ((!drawUnrated && !element.IsRated) || element.TotalResult.Count === 0) return;
        if (lastRank !== element.Rank) {
            addRow();
            tiedList.length = 0;
            ratedRank += ratedCount;
            ratedCount = 0;
        }
        tiedList.push(element);
        lastRank = element.Rank;
        if (isRated(element)) ratedCount++;
    });
    addRow();
    table.draw();
}

function searchUser(): void {
    function setAlert(val: string): void {
        $("#username-search-input").addClass("is-invalid");
        $("#username-search-alert").text(val);
    }
    function clearAlert(): void {
        $("#username-search-input").removeClass("is-invalid");
        $("#username-search-alert").empty();
    }

    clearAlert();
    const targetUserScreenName = $("#username-search-input").val();
    if (targetUserScreenName === "") {
        setAlert("ユーザー名を入力してください");
        return;
    }
    const index = currentTable.rows.findIndex(row => row.userScreenName === targetUserScreenName);
    if (index === -1) {
        setAlert("ユーザー名が見つかりませんでした");
        return;
    }
    currentTable.highlight(index);
}

$(async () => {
    $("#show-unrated-description").tooltip();

    //ユーザー名検索
    document.getElementById("username-search-button").onclick = searchUser;
    document.getElementById("username-search-input").onkeypress = (pressedKey): void => {
        if (pressedKey.which === 13) searchUser();
    };

    $("#confirm-btn").click(async () => {
        const contestScreenName = $("#contest-selector").val();
        if (typeof contestScreenName === "undefined") return;
        toggleLoadingState();
        try {
            await DrawTable(String(contestScreenName), $("#show-unrated").prop("checked")).then(() => {
                toggleLoadingState();
            });
        } catch (e) {
            toggleLoadingState();
        }
    });

    setItemToSelector(await getContestsAsync());
});
