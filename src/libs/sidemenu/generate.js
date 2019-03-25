import './sidemenu.scss';
import sidemenuHtml from './sidemenu.html';

export function generateSideMenu() {
    $('#main-div').append(sidemenuHtml);

    var windowHeight = $(window).height();
    $('#sidemenu').height(windowHeight);

    //メニュー開閉
    $('#sidemenu-key').click(function () {
        $('#sidemenu-key').toggleClass('glyphicon-menu-left');
        $('#sidemenu-key').toggleClass('glyphicon-menu-right');
        $('#menu_wrap').toggleClass('sidemenu-active');
    });

    //画面リサイズ時にheightを読み直し
    $(window).resize(function () {
        $('#sidemenu').height($(window).height());
    });

    //アコーディオンメニュー
    $('#sidemenu').on('click', '.menu-header', (event) => {
        $(event.target).parents('.menu-wrapper').find('.menu-box').toggleClass('menu-box-collapse');
        $(event.target).find('.glyphicon').toggleClass('glyphicon-menu-down');
        $(event.target).find('.glyphicon').toggleClass('glyphicon-menu-up');
    });
}