import modalHTML from "./modal.html";
import newDropdownElem from "./newDropdownElem.html";
import legacyDropdownElem from "./legacyDropdownElem.html";
import { substitute } from "../../i18n/i18n";

export default class ConfigView {
  modalElement: HTMLElement;
  constructor(modalElement: HTMLElement) {
    this.modalElement = modalElement;
  }

  public addCheckbox(label: string, val: boolean, handler: (val: boolean) => void) {
    const settingsRow = this.getSettingsRow();
    
    const div = document.createElement("div");
    div.classList.add("checkbox");
    const labelElem = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = val;
    labelElem.append(input);
    labelElem.append(label);
    div.append(labelElem);
    settingsRow.append(div);

    input.addEventListener("change", () => {
      handler(input.checked);
    });
  }

  public addHeader(level: 1 | 2 | 3 | 4 | 5 | 6, content: string) {
    const settingsRow = this.getSettingsRow();

    const div = document.createElement(`h${level}`);
    div.textContent = content;
    settingsRow.append(div);
  }

  private getSettingsRow() {
    return this.modalElement.querySelector(".settings-row")!;
  }

  static Create() {
    document.querySelector("body")?.insertAdjacentHTML("afterbegin", substitute(modalHTML));
    document.querySelector(".header-mypage_list li:nth-last-child(1)")?.insertAdjacentHTML("beforebegin", substitute(newDropdownElem));
    document.querySelector(".navbar-right .dropdown-menu .divider:nth-last-child(2)")?.insertAdjacentHTML("beforebegin", substitute(legacyDropdownElem));

    const element = document.querySelector<HTMLElement>("#modal-ac-predictor-settings");
    if (element === null) {
      throw new Error("settings modal not found");
    }
    return new ConfigView(element);
  }
}
