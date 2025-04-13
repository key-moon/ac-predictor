// @ts-nocheck

import getHistory from "../data/history";
import { calcAlgRatingFromHistory, calcRequiredPerformance, positivizeRating, unpositivizeRating } from "../domain/rating";

var dom$1 = "<div id=\"estimator-alert\"></div>\n<div class=\"row\">\n\t<div class=\"input-group\">\n\t\t<span class=\"input-group-addon\" id=\"estimator-input-desc\"></span>\n\t\t<input type=\"number\" class=\"form-control\" id=\"estimator-input\">\n\t</div>\n</div>\n<div class=\"row\">\n\t<div class=\"input-group\">\n\t\t<span class=\"input-group-addon\" id=\"estimator-res-desc\"></span>\n\t\t<input class=\"form-control\" id=\"estimator-res\" disabled=\"disabled\">\n\t\t<span class=\"input-group-btn\">\n\t\t\t<button class=\"btn btn-default\" id=\"estimator-toggle\">入替</button>\n\t\t</span>\n\t</div>\n</div>\n<div class=\"row\" style=\"margin: 10px 0px;\">\n\t<a class=\"btn btn-default col-xs-offset-8 col-xs-4\" rel=\"nofollow\" onclick=\"window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;\" id=\"estimator-tweet\">ツイート</a>\n</div>";
 
class EstimatorModel {
  inputDesc: string;
  resultDesc: string;
  perfHistory: number[]
  constructor(inputValue: number, perfHistory: number[]) {
    this.inputDesc = "";
    this.resultDesc = "";
    this.perfHistory = perfHistory;
    this.updateInput(inputValue);

  }

  inputValue!: number;
  resultValue!: number;
  updateInput(value: number) {
    this.inputValue = value;
    this.resultValue = this.calcResult(value);
  }
  toggle() {
    return null;
  }
  calcResult(input: number): number {
    return input;
  }
}
 
class CalcRatingModel extends EstimatorModel {
    constructor(inputValue: number, perfHistory: number[]) {
        super(inputValue, perfHistory);
        this.inputDesc = "パフォーマンス";
        this.resultDesc = "到達レーティング";
    }
    // @ts-ignore
    toggle() {
      return new CalcPerfModel(this.resultValue, this.perfHistory);
    }
    calcResult(input: number): number {
      return positivizeRating(calcAlgRatingFromHistory(this.perfHistory.concat([input])));
    }
}
 
class CalcPerfModel extends EstimatorModel {
  constructor(inputValue: number, perfHistory: number[]) {
    super(inputValue, perfHistory);
    this.inputDesc = "目標レーティング";
    this.resultDesc = "必要パフォーマンス";
  }
  // @ts-ignore
  toggle() {
      return new CalcRatingModel(this.resultValue, this.perfHistory);
  }
  calcResult(input: number): number {
    return calcRequiredPerformance(unpositivizeRating(input), this.perfHistory);
  }
}
 
function GetEmbedTweetLink(content: string, url: string) {
    return `https://twitter.com/share?text=${encodeURI(content)}&url=${encodeURI(url)}`;
}
 
function getLS(key: string) {
    const val = localStorage.getItem(key);
    return (val ? JSON.parse(val) : val);
}
function setLS(key: string, val): string {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    }
    catch (error) {
        console.log(error);
    }
}
const models = [CalcPerfModel, CalcRatingModel];
function GetModelFromStateCode(state: string, value: number, history: number[]) {
    let model = models.find((model) => model.name === state);
    if (!model)
        model = CalcPerfModel;
    return new model(value, history);
}

function getPerformanceHistories(history: any[]) {
  const onlyRated = history.filter((x) => x.IsRated);
  onlyRated.sort((a, b) => {
      return new Date(a.EndTime).getTime() - new Date(b.EndTime).getTime();
  });
  return onlyRated.map((x) => x.Performance);
}

function roundValue(value: number, numDigits: number) {
  return Math.round(value * Math.pow(10, numDigits)) / Math.pow(10, numDigits);
}

class EstimatorElement {
  id: string
  title: string
  document: string
  constructor() {
    this.id = "estimator";
    this.title = "Estimator";
    this.document = dom$1;
  }
  async afterOpen() {
    const estimatorInputSelector = document.getElementById("estimator-input")! as HTMLInputElement;
    const estimatorResultSelector = document.getElementById("estimator-res")! as HTMLInputElement;
    let model = GetModelFromStateCode(getLS("sidemenu_estimator_state"), getLS("sidemenu_estimator_value"), getPerformanceHistories((await getHistory(userScreenName)).data));
    updateView();
    document.getElementById("estimator-toggle")!.addEventListener("click", () => {
      model = model.toggle();
      updateLocalStorage();
      updateView();
    });
    estimatorInputSelector.addEventListener("keyup", () => {
      updateModel();
      updateLocalStorage();
      updateView();
    });
    /** modelをinputの値に応じて更新 */
    function updateModel() {
      const inputNumber = estimatorInputSelector.valueAsNumber;
      if (!isFinite(inputNumber))
        return;
      model.updateInput(inputNumber);
    }
    /** modelの状態をLSに保存 */
    function updateLocalStorage() {
      setLS("sidemenu_estimator_value", model.inputValue);
      setLS("sidemenu_estimator_state", model.constructor.name);
    }
    /** modelを元にviewを更新 */
    function updateView() {
      const roundedInput = roundValue(model.inputValue, 2);
      const roundedResult = roundValue(model.resultValue, 2);
      document.getElementById("estimator-input-desc")!.innerText = model.inputDesc;
      document.getElementById("estimator-res-desc")!.innerText = model.resultDesc;
      estimatorInputSelector.value = String(roundedInput);
      estimatorResultSelector.value = String(roundedResult);
      const tweetStr = `AtCoderのハンドルネーム: ${userScreenName}\n${model.inputDesc}: ${roundedInput}\n${model.resultDesc}: ${roundedResult}\n`;
      document.getElementById("estimator-tweet")!.href = GetEmbedTweetLink(tweetStr, "https://greasyfork.org/ja/scripts/369954-ac-predictor");
    }
  };
  GetHTML() {
    return `<div class="menu-wrapper">
<div class="menu-header">
    <h4 class="sidemenu-txt">${this.title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
</div>
<div class="menu-box"><div class="menu-content" id="${this.id}">${this.document}</div></div>
</div>`;
  }
}
const estimator = new EstimatorElement();
 
var sidemenuHtml = "<style>\n    #menu-wrap {\n        pointer-events: none;\n        display: block;\n        position: fixed;\n        top: 0;\n        z-index: 20;\n        width: 400px;\n        right: -350px;\n        transition: all 150ms 0ms ease;\n        margin-top: 50px;\n    }\n\n    #sidemenu {\n        pointer-events: auto;\n        background: #000;\n        opacity: 0.85;\n    }\n    #sidemenu-key {\n        pointer-events: auto;\n        border-radius: 5px 0px 0px 5px;\n        background: #000;\n        opacity: 0.85;\n        color: #FFF;\n        padding: 30px 0;\n        cursor: pointer;\n        margin-top: 100px;\n        text-align: center;\n    }\n\n    #sidemenu {\n        display: inline-block;\n        width: 350px;\n        float: right;\n    }\n\n    #sidemenu-key {\n        display: inline-block;\n        width: 50px;\n        float: right;\n    }\n\n    .sidemenu-active {\n        transform: translateX(-350px);\n    }\n\n    .sidemenu-txt {\n        color: #DDD;\n    }\n\n    .menu-wrapper {\n        border-bottom: 1px solid #FFF;\n    }\n\n    .menu-header {\n        margin: 10px 20px 10px 20px;\n        user-select: none;\n    }\n\n    .menu-box {\n        overflow: hidden;\n        transition: all 300ms 0s ease;\n    }\n    .menu-box-collapse {\n        height: 0px !important;\n    }\n    .menu-box-collapse .menu-content {\n        transform: translateY(-100%);\n    }\n    .menu-content {\n        padding: 10px 20px 10px 20px;\n        transition: all 300ms 0s ease;\n    }\n    .cnvtb-fixed {\n        z-index: 19;\n    }\n</style>\n<div id=\"menu-wrap\">\n    <div id=\"sidemenu\" class=\"container\"></div>\n    <div id=\"sidemenu-key\" class=\"glyphicon glyphicon-menu-left\"></div>\n</div>";
 
class SideMenu {
  pendingElements: EstimatorElement[];
  constructor() {
      this.pendingElements = [];
      this.Generate();
  }
  Generate() {
    document.getElementById("main-div")!.insertAdjacentHTML("afterbegin", sidemenuHtml);
    resizeSidemenuHeight();
    const key = document.getElementById("sidemenu-key")!;
    const wrap = document.getElementById("menu-wrap")!;
    key.addEventListener("click", () => {
      this.pendingElements.forEach((elem) => {
        elem.afterOpen();
      });
      this.pendingElements.length = 0;
      key.classList.toggle("glyphicon-menu-left");
      key.classList.toggle("glyphicon-menu-right");
      wrap.classList.toggle("sidemenu-active");
    });
    window.addEventListener("onresize", resizeSidemenuHeight);
    document.getElementById("sidemenu")!.addEventListener("click", (event) => {
      const target = event.target;
      const header = target.closest(".menu-header");
      if (!header)
        return;
      const box = target.closest(".menu-wrapper").querySelector(".menu-box");
      box.classList.toggle("menu-box-collapse");
      const arrow = target.querySelector(".glyphicon");
      arrow.classList.toggle("glyphicon-menu-down");
      arrow.classList.toggle("glyphicon-menu-up");
    });
    function resizeSidemenuHeight() {
      document.getElementById("sidemenu").style.height = `${window.innerHeight}px`;
    }
  }
  addElement(element) {
    const sidemenu = document.getElementById("sidemenu");
    sidemenu.insertAdjacentHTML("afterbegin", element.GetHTML());
    const content = sidemenu.querySelector(".menu-content");
    content.parentElement.style.height = `${content.offsetHeight}px`;
    // element.afterAppend();
    this.pendingElements.push(element);
  }
}

export default function add() {
  const sidemenu = new SideMenu();
  const elements = [estimator];
  for (let i = elements.length - 1; i >= 0; i--) {
    sidemenu.addElement(elements[i]);
  }  
}
