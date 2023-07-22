import { getConfig, setConfig } from "../util/config";
import isDebugMode from "../util/isdebugmode";
import ConfigView from "../view/config/config";

export default class ConfigController {
  public register() {
    const configView = ConfigView.Create();
    
    configView.addCheckbox("hide prediction during contests", getConfig("hideDuringContest"), val => setConfig("hideDuringContest", val));
    if (isDebugMode()) {
      configView.addCheckbox("[DEBUG] use results", getConfig("useResults"), val => setConfig("useResults", val));
    }
  }
}
