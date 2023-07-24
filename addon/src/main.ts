import ConfigController from "./controller/configcontroller";
import StandingsPageController from "./controller/standingspagecontroller";
import VirtualStandingsPageController from "./controller/virtualstandingspagecontroller";
import isStandingsPage from "./parse/isStandingsPage";
import isVirtualStandingsPage from "./parse/isVirtualStandingsPage";

{
  const controller = new ConfigController();
  controller.register();
}

if (isStandingsPage()) {
  const controller = new StandingsPageController();
  controller.register();
}

if (isVirtualStandingsPage()) {
  const controller = new VirtualStandingsPageController();
  controller.register();
}

