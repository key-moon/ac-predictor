import './sidemenu.scss';
import * as $ from 'jQuery';
import sidemenuHtml from './sidemenu.html';
import { SideMenuElement } from './element';

class SideMenu {
	constructor() {

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
}
