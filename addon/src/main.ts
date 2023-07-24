import ConfigController from "./controller/configcontroller";
import add from "./controller/legacysidemenucontroller";
import StandingsPageController from "./controller/standingspagecontroller";
import VirtualStandingsPageController from "./controller/virtualstandingspagecontroller";
import isStandingsPage from "./parse/isStandingsPage";
import isVirtualStandingsPage from "./parse/isVirtualStandingsPage";

{
  const controller = new ConfigController();
  controller.register();

  add();
}

if (isStandingsPage()) {
  const controller = new StandingsPageController();
  controller.register();
}

if (isVirtualStandingsPage()) {
  const controller = new VirtualStandingsPageController();
  controller.register();
}
