import { StandingsTableUpdater } from "./standingsTableUpdater";
import { StandingsRowModifier } from "../standingsRowModifier/standingsRowModifier";

export class AllRowUpdater implements StandingsTableUpdater {
    rowModifier: StandingsRowModifier;

    update(table: HTMLTableElement): void {
        Array.from(table.rows).forEach((row) => this.rowModifier.modifyRow(row));
    }
}
