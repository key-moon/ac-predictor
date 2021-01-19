function getGlobalVals(): Record<string, unknown> {
    const script = [...document.querySelectorAll("head script:not([src])")].map((x) => x.innerHTML).join("\n");
    const res = {};
    script.match(/var [^ ]+ = .+$/gm).forEach((statement) => {
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

export const globalVals: Record<string, unknown> = getGlobalVals();
export const userScreenName: string = globalVals["userScreenName"] as string;
export const LANG: string = globalVals["LANG"] as string;
export const csrfToken: string = globalVals["csrfToken"] as string;

export const contestScreenName: string = globalVals["contestScreenName"] as string;
export const countDownText: string = globalVals["countDownText"] as string;
export const remainingText: string = globalVals["remainingText"] as string;
export const startTime: Date = globalVals["startTime"] as Date;
export const endTime: Date = globalVals["endTime"] as Date;
