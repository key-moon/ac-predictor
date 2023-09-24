import ConfigController from "./controller/configcontroller";
import ExtendedStandingsPageController from "./controller/extendedstandingspagecontroller";
import add from "./controller/legacysidemenucontroller";
import StandingsPageController from "./controller/standingspagecontroller";
import VirtualStandingsPageController from "./controller/virtualstandingspagecontroller";
import isExtendedStandingsPage from "./parse/isExtendedStandingsPage";
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

if (isExtendedStandingsPage()) {
  const controller = new ExtendedStandingsPageController();
  controller.register();
}

