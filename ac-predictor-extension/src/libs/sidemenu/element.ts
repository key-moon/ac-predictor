/**
 * サイドメニューに追加される要素のクラス
 */
export class SideMenuElement {
    title: string;
    match: RegExp;
    id: string;
    document: string;
    afterAppend: Function;
    afterOpen: Function;

    constructor(id: string, title: string, match: RegExp, document: string, afterAppend: Function, afterOpen: Function) {
        this.id = id;
        this.title = title;
        this.match = match;
        this.document = document;
        this.afterAppend = afterAppend;
        this.afterOpen = afterOpen;
    }

    shouldDisplayed(url: string): boolean {
        return this.match.test(url);
    }

    /**
     * 要素のHTMLを取得
     */
    GetHTML(): string {
        return `<div class="menu-wrapper">
    <div class="menu-header">
        <h4 class="sidemenu-txt">${this.title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
    </div>
    <div class="menu-box"><div class="menu-content" id="${this.id}">${this.document}</div></div>
</div>`;
    }
}
