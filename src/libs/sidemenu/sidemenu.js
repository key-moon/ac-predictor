import './sidemenu.scss';
import * as $ from 'jquery';
import sidemenuHtml from './sidemenu.html';
import { SideMenuElement } from './element';

export class SideMenu {
    constructor() {
        this.Generate();
    }

    Generate() {
        $('#main-div').append(sidemenuHtml);
        resizeSidemenuHeight();
        $('#sidemenu-key').click(function () {
            $('#sidemenu-key').toggleClass('glyphicon-menu-left glyphicon-menu-right');
            $('#menu_wrap').toggleClass('sidemenu-active');
        });
        $(window).resize(resizeSidemenuHeight);
        $('#sidemenu').on('click', '.menu-header', (event) => {
            $(event.target).parents('.menu-wrapper').find('.menu-box').toggleClass('menu-box-collapse');
            $(event.target).find('.glyphicon').toggleClass('glyphicon-menu-down glyphicon-menu-up');
        });

        function resizeSidemenuHeight() {
            $('#sidemenu').height($(window).height());
        }
    }

    /**
     * サイドメニューに要素を追加します
     * @param {SideMenuElement} [element] 追加する要素
     */
    addElement(element) {
        if (!element.shouldDisplayed(document.location.href)) return;
        const elementHtml = $(element.GetHTML());
        $('#sidemenu').append(elementHtml);
        elementHtml.ready(() => {
            const content = $('.menu-content', elementHtml);
            content.parents('.menu-box').css('height', content.outerHeight(true));
            element.afterAppend();
        });
    }
}
