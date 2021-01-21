/**
 * サイドメニューに追加される要素のクラス
 */
export abstract class SideMenuElement {
    abstract title: string;
    abstract match: RegExp;
    abstract id: string;
    abstract document: string;

    abstract afterAppend(): void;
    abstract afterOpen(): void;

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
