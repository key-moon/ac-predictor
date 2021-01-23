import { PerfAndRateChangeAppender } from "../../../../../src/elements/predictor/controller/standingsRowModifier/perfAndRateChangeAppender";
import { Results } from "../../../../../src/libs/contest/results/results";
import {Result} from "../../../../../src/libs/contest/results/result";

let resultDic: { [key: string]: Result } = {};
let appender: PerfAndRateChangeAppender;

function htmlToElement(html: string): HTMLElement {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild as HTMLElement;
}

function generateContentElement(score: number, result: Result, store: boolean = true): HTMLTableRowElement {
    const userScreenName = result.UserScreenName;
    if (store) resultDic[userScreenName] = result;
    const elem = htmlToElement(`<tbody><tr><td class="standings-rank">${result.Place}</td><td class="standings-username"><a href="/users/${userScreenName}" class="username"><span>${userScreenName}</span></a></td><<td class="standings-result"><p><span class="standings-score">${score}</span></p></td></tr></tbody>`);
    return elem.firstChild as HTMLTableRowElement;
}

function generateUnParticipatedContentElement(userScreenName: string, colspan: number = 1): HTMLTableRowElement {
    const elem = htmlToElement(`<tbody><tr><td class="standings-rank">-</td><td class="standings-username"><a href="/users/${userScreenName}" class="username"><span>${userScreenName}</span></a></td><td colspan="${colspan}" class="standings-result"><p>-</p></td></tr></tbody>`);
    return elem.firstChild as HTMLTableRowElement;
}

function generateHeaderElement(): HTMLTableRowElement {
    const elem = htmlToElement("<thead><tr><th>順位</th><th>ユーザ</th><th>得点</th></tr></thead>");
    return elem.firstChild as HTMLTableRowElement;
}


beforeEach(() => {
    resultDic = {};
    appender = new PerfAndRateChangeAppender();
    appender.results = {
        getUserResult: jest.fn<Result, [string]>().mockImplementation((key) => resultDic[key])
    } as Results;
    appender.isRated = true;
});

test("test header", () => {
    const header = generateHeaderElement();
    const prevChildCnt = header.childElementCount;
    appender.modifyHeader(header);
    const afterChildCnt1 = header.childElementCount;
    expect(afterChildCnt1 - prevChildCnt).toBe(2);
    expect(header.children[afterChildCnt1 - 2].textContent).toBe("perf");
    expect(header.children[afterChildCnt1 - 1].textContent).toBe("レート変化");
    appender.modifyHeader(header);
    const afterChildCnt2 = header.childElementCount;
    expect(afterChildCnt2 - afterChildCnt1).toBe(0);
});

test("test content of rated contestant", () => {
    const result = new Result(true, true, "tourist", 1, 1, 3900, 4000, 10, 4000, null);
    const content = generateContentElement(100, result);
    const prevChildCnt = content.childElementCount;
    appender.modifyContent(content);
    const afterChildCnt1 = content.childElementCount;
    expect(afterChildCnt1 - prevChildCnt).toBe(2);
    expect(content.children[afterChildCnt1 - 2].textContent).toBe("4000");
    expect(content.children[afterChildCnt1 - 1].textContent).toBe("3900 → 4000 (+100)");
    appender.modifyContent(content);
    const afterChildCnt2 = content.childElementCount;
    expect(afterChildCnt2 - afterChildCnt1).toBe(0);
});

test("test content of unrated contestant", () => {
    const result = new Result(false, true, "tourist", 1, 1, 3900, 4000, 10, 4000, null);
    const content = generateContentElement(100, result);
    appender.modifyContent(content);
    const afterChildCnt = content.childElementCount;
    expect(content.children[afterChildCnt - 2].textContent).toBe("4000");
    expect(content.children[afterChildCnt - 1].textContent).toBe("3900 (unrated)");
});

test("test content of not participated contestant", () => {
    const result = new Result(false, false, "tourist", 1, 1, 3900, 4000, 10, null, null);
    const content = generateContentElement(100, result);
    appender.modifyContent(content);
    const afterChildCnt = content.childElementCount;
    expect(content.children[afterChildCnt - 2].textContent).toBe("-");
    expect(content.children[afterChildCnt - 1].textContent).toBe("3900 (unrated)");
});

test("test content of data not provided contestant", () => {
    const result = new Result(false, false, "tourist", 1, 1, 3900, 4000, 10, null, null);
    const content = generateContentElement(100, result, false);
    appender.modifyContent(content);
    const afterChildCnt = content.childElementCount;
    expect(content.children[afterChildCnt - 2].textContent).toBe("-");
    expect(content.children[afterChildCnt - 1].textContent).toBe("-");
});

test("test content of not registered contestant", () => {
    const result = new Result(false, false, "tourist", 1, 1, 3900, 4000, 10, null, null);
    const content = generateUnParticipatedContentElement("tourist", 1);
    const prevChildCnt = content.childElementCount;
    appender.modifyContent(content);
    const afterChildCnt1 = content.childElementCount;
    expect(content.children[afterChildCnt1 - 1].getAttribute("colspan")).toBe("3");
    expect(afterChildCnt1 - prevChildCnt).toBe(0);
});
