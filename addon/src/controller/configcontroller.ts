import { getTranslation } from "../i18n/i18n";
import { getConfig, setConfig } from "../util/config";
import isDebugMode from "../util/isdebugmode";
import ConfigView from "../view/config/config";

export default class ConfigController {
  public register() {
    const configView = ConfigView.Create();
    
    configView.addCheckbox(getTranslation("config_useFinalResultOnVirtual_label"), getConfig("useFinalResultOnVirtual"), val => setConfig("useFinalResultOnVirtual", val));
    configView.addCheckbox(getTranslation("config_hideDuringContest_label"), getConfig("hideDuringContest"), val => setConfig("hideDuringContest", val));
    configView.addCheckbox(getTranslation("config_hideUntilFixed_label"), getConfig("hideUntilFixed"), val => setConfig("hideUntilFixed", val));
    if (isDebugMode()) {
      configView.addCheckbox("[DEBUG] enable debug mode", getConfig("isDebug"), val => setConfig("isDebug", val));
      configView.addCheckbox("[DEBUG] use results", getConfig("useResults"), val => setConfig("useResults", val));
    }
  }
}
