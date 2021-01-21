export abstract class StandingsRowModifier {
    isHeader(row: HTMLTableRowElement): boolean {
        return row.parentElement.tagName.toLowerCase() == "thead";
    }
    isFooter(row: HTMLTableRowElement): boolean {
        return row.firstElementChild.hasAttribute("colspan") && row.firstElementChild.getAttribute("colspan") == "3";
    }
    modifyRow(row: HTMLTableRowElement): void {
        if (this.isHeader(row)) this.modifyHeader(row);
        else if (this.isFooter(row)) this.modifyFooter(row);
        else this.modifyContent(row);
    }

    abstract modifyHeader(header: HTMLTableRowElement): void;
    abstract modifyContent(content: HTMLTableRowElement): void;
    abstract modifyFooter(footer: HTMLTableRowElement): void;
}
