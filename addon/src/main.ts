import StandingsPageController from "./controller/standingspagecontroller";
import isStandingsPage from "./parse/isStandingsPage";

if (isStandingsPage()) {
  const controller = new StandingsPageController();
  controller.register();
}
