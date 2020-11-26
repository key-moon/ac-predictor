function getGlobalVals(): {} {
    const script = [...document.querySelectorAll("head script:not([src])")].map(x => x.innerHTML).join("\n");
    const res = {};
    script.match(/var [^ ]+ = .+$/gm).forEach(statement => {
        const match = /var ([^ ]+) = (.+)$/m.exec(statement);
        res[match[1]] = eval(match[2]);
    });
    return res;
}

export const globalVals = getGlobalVals();
export const userScreenName: string = globalVals["userScreenName"];
export const LANG: string = globalVals["LANG"];
export const csrfToken: string = globalVals["csrfToken"];

export const contestScreenName: string = globalVals["contestScreenName"];
export const countDownText: string = globalVals["countDownText"];
export const remainingText: string = globalVals["remainingText"];
export const startTime: Date = globalVals["startTime"]?.toDate();
export const endTime: Date = globalVals["endTime"]?.toDate();
