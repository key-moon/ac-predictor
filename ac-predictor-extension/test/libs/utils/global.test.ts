import * as fs from "fs";
import { dataDir } from "../../data/data";

const html = fs.readFileSync(dataDir + "/global.html").toString();
const dom = new DOMParser().parseFromString(html,"text/html");

Object.defineProperty(window, "document", { writable: true, value: dom });
import { globalVals } from "../../../src/libs/utils/global";

test("parse check", () => {
    expect(globalVals["str"]).toBe("str");
    //expect(globalVals["obj"]).toStrictEqual({ a: "a", b: "b" });
    //expect(globalVals["num"]).toBe(1);
    //expect(globalVals["arr"]).toStrictEqual([1, 2, 3]);
    expect(globalVals["body"]).toBeUndefined();
});
