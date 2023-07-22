import ConfigController from "./controller/configcontroller";
import StandingsPageController from "./controller/standingspagecontroller";
import isStandingsPage from "./parse/isStandingsPage";

{
  const controller = new ConfigController();
  controller.register();
}

if (isStandingsPage()) {
  const controller = new StandingsPageController();
  controller.register();
}
