interface StandingsRowModifier {
    modifyHeader(header: HTMLTableRowElement);
    modifyContent(content: HTMLTableRowElement);
    modifyFooter(footer: HTMLTableRowElement);
}
