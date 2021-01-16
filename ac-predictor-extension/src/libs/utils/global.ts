function getGlobalVals(): {} {
    const script = [...document.querySelectorAll("head script:not([src])")].map(x => x.innerHTML).join("\n");
    const res = {};
    script.match(/var [^ ]+ = .+$/gm).forEach(statement => {
        const match = /var ([^ ]+) = (.+)$/m.exec(statement);
        function safeEval(val: string): unknown {
            function trim(val: string): string {
                while (val.endsWith(";") || val.endsWith(" ")) val = val.substr(0, val.length - 1);
                while (val.startsWith(" ")) val = val.substr(1, val.length - 1);
                return val;
            }
            function isStringToken(val: string): boolean {
                return 1 < val.length && val.startsWith('"') && val.endsWith('"');
            }
            function evalStringToken(val: string): string {
                if (!isStringToken(val)) throw new Error();
                return val.substr(1, val.length - 2); // TODO: parse escape
            }
            val = trim(val);
            if (isStringToken(val)) return evalStringToken(val);
            if (val.startsWith("moment(")) return new Date(evalStringToken(trim(val.substr(7, val.length - (7 + 1)))));
            return val;
        }
        res[match[1]] = safeEval(match[2]);
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
export const startTime: Date = globalVals["startTime"];
export const endTime: Date = globalVals["endTime"];
