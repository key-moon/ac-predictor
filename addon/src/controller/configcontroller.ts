import { getTranslation } from "../i18n/i18n";
import { getConfig, setConfig } from "../util/config";
import isDebugMode from "../util/isdebugmode";
import ConfigView from "../view/config/config";

export default class ConfigController {
  public register() {
    const configView = ConfigView.Create();
    
    // TODO: 流石に処理をまとめたい
    configView.addCheckbox(getTranslation("config_useFinalResultOnVirtual_label"), getConfig("useFinalResultOnVirtual"), getTranslation("config_useFinalResultOnVirtual_description"), val => setConfig("useFinalResultOnVirtual", val));
    configView.addCheckbox(getTranslation("config_hideDuringContest_label"), getConfig("hideDuringContest"), null, val => setConfig("hideDuringContest", val));
    configView.addCheckbox(getTranslation("config_hideUntilFixed_label"), getConfig("hideUntilFixed"), null, val => setConfig("hideUntilFixed", val));
    if (isDebugMode()) {
      configView.addCheckbox("[DEBUG] enable debug mode", getConfig("isDebug"), null, val => setConfig("isDebug", val));
      configView.addCheckbox("[DEBUG] use results", getConfig("useResults"), null, val => setConfig("useResults", val));
      configView.addCheckbox("[DEBUG] compare", getConfig("compareComputations"), null, val => setConfig("compareComputations", val));
    }
  }
}
