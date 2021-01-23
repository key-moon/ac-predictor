import {StandingsRowModifier} from "../../../../../src/elements/predictor/controller/standingsRowModifier/standingsRowModifier";
import {AllRowUpdater} from "../../../../../src/elements/predictor/controller/standingsTableUpdater/allRowUpdater";

class Modifier extends StandingsRowModifier {
    modifyContent = jest.fn<void, [HTMLTableRowElement]>();
    modifyFooter = jest.fn<void, [HTMLTableRowElement]>();
    modifyHeader = jest.fn<void, [HTMLTableRowElement]>();
}

function htmlToElement(html: string): HTMLElement {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild as HTMLElement;
}

const tableElem = htmlToElement(`<table>
<thead>
<tr><td>header</td></tr>
</thead>
<tbody>
<tr><td>1</td></tr>
<tr><td>2</td></tr>
<tr><td colspan="3">footer</td></tr>
</tbody>
</table>`) as HTMLTableElement;

test("test updater", () => {
    const modifier = new Modifier();
    const updater = new AllRowUpdater();
    updater.rowModifier = modifier;

    updater.update(tableElem);

    expect(modifier.modifyHeader.mock.calls.length).toBe(1);
    expect(modifier.modifyHeader.mock.calls[0][0].textContent).toBe("header");

    expect(modifier.modifyContent.mock.calls.length).toBe(2);
    expect(modifier.modifyContent.mock.calls[0][0].textContent).toBe("1");
    expect(modifier.modifyContent.mock.calls[1][0].textContent).toBe("2");

    expect(modifier.modifyFooter.mock.calls.length).toBe(1);
    expect(modifier.modifyFooter.mock.calls[0][0].textContent).toBe("footer");
});
