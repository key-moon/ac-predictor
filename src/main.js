import {initializeID} from './libs/tabID';
import {SideMenu} from "./libs/sidemenu/sidemenu";
import {predictor} from "./elements/predictor/script";
import {estimator} from "./elements/estimator/script";

initializeID();

let sidemenu = new SideMenu();

sidemenu.addElement(predictor);
sidemenu.addElement(estimator);
