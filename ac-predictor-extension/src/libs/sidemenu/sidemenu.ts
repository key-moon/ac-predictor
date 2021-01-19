//import "./sidemenu.scss";
import sidemenuHtml from "./sidemenu.html";
import { SideMenuElement } from "./element";

export class SideMenu {
    constructor() {
        this.Generate();
    }

    Generate(): void {
        document.getElementById("main-div").insertAdjacentHTML("afterbegin", sidemenuHtml);
        resizeSidemenuHeight();
        const key = document.getElementById("sidemenu-key");
        const wrap = document.getElementById("menu-wrap");
        key.addEventListener("click", () => {
            this.pendingElements.forEach((elem) => {
                elem.afterOpen();
            });
            this.pendingElements.length = 0;
            key.classList.toggle("glyphicon-menu-left");
            key.classList.toggle("glyphicon-menu-right");
            wrap.classList.toggle("sidemenu-active");
        });
        window.addEventListener("onresize", resizeSidemenuHeight);
        document.getElementById("sidemenu").addEventListener("click", (event) => {
            const target = event.target as HTMLElement;
            const header = target.closest(".menu-header");
            if (!header) return;
            const box = target.closest(".menu-wrapper").querySelector(".menu-box");
            box.classList.toggle("menu-box-collapse");
            const arrow = target.querySelector(".glyphicon");
            arrow.classList.toggle("glyphicon-menu-down");
            arrow.classList.toggle("glyphicon-menu-up");
        });

        function resizeSidemenuHeight(): void {
            document.getElementById("sidemenu").style.height = `${window.innerHeight}px`;
        }
    }

    pendingElements: SideMenuElement[] = [];
    addElement(element: SideMenuElement): void {
        if (!element.shouldDisplayed(document.location.href)) return;
        const sidemenu = document.getElementById("sidemenu");
        sidemenu.insertAdjacentHTML("afterbegin", element.GetHTML());
        const content: HTMLElement = sidemenu.querySelector(".menu-content");
        content.parentElement.style.height = `${content.offsetHeight}px`;
        element.afterAppend();
        this.pendingElements.push(element);
    }
}
