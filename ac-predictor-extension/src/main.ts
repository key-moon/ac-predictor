import { predictor } from "./elements/predictor/script";
import { estimator } from "./elements/estimator/script";
import { SideMenu } from "./libs/sidemenu/sidemenu";

const sidemenu = new SideMenu();

const elements = [predictor, estimator];

for (let i = elements.length - 1; i >= 0; i--) {
    sidemenu.addElement(elements[i]);
}
