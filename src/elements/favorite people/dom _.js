const FAVSETS_KEY = 'favsets';
const SELECTEDSET_KEY = 'selectedset';

var favSets = {};

var currentSelectedSet = new Set();
ReloadSelectedSet();
ReloadSets();

DrawCheckBoxes();


function ShowModal() {
    InitModal();
    SideMenu.Modal.Show();
    function InitModal() {

    }
}

function DrawCheckBoxes() {
    var $checkBoxesDiv = $('#favmanager-checkboxes');
    $checkBoxesDiv.empty();
    for (var key in favSets) {
        $checkBoxesDiv.append(generateCheckBoxElem(key));
    }

    $('#favmanager-checkboxes > input').click((e) => {
        var target = e.target;
        if (target.checked) AddSelected(e.target.name);
        else DeleteSelected(target.name);
    });
    
    function generateCheckBoxElem(key) {
        `<div class="checkbox"><label><input type="checkbox" value="${escape(key)}" ${(currentSelectedSet.has(key) ? "checked" : "")}>${escape(key)}</label></div>`;
    }
}


function RecalcFavs() {
    var newFavSet = new Set();
    currentSelectedSet.forEach(key => {
        favSets[key].forEach(x => {
            newFavSet.add(x);
        });
    });
    favSet = newFavSet;
}

function AddFavs(key, vals) {
    vals.forEach(x => {
        AddFav(key, x, false);
    });
    StoreSets();
    RecalcFavs();
}

function AddFav(key, val, doStore = true) {
    if (!favSets[key]) favSets[key] = new Set();
    favSets[key].add(val);

    if (doStore) {
        StoreSets();
        RecalcFavs();
    }
}

function DeleteFav(key, val, doStore = true) {
    if (!favSets[key]) return;
    favSets[key].deleye(val);

    if (doStore) {
        StoreSets();
        RecalcFavs();
    }
}

function ReloadSets() {
    var sets = getLS(FAVSETS_KEY);
    if (sets === null) {
        reloadFavs();
        sets = {};
        sets['uncategorized'] = new Set(favSet); //ŽQÆ“n‚µ‚Ì–hŽ~
        currentSelectedSet.add('uncategorized');
        StoreSelectedSet();
    }
    favSets = sets;
    RecalcFavs();
}

function StoreSets() {
    favSets.forEach(() => {

    });
    setLS(FAVSETS_KEY, favSets);
}

function ToggleSelected(val) {
    if (currentSelectedSet.has(val)) DeleteSelected();
    else AddSelected();
}

function AddSelected(val) {
    currentSelectedSet.add(val);
}

function DeleteSelected() {
    currentSelectedSet.delete(val);
}

function ReloadSelectedSet() {
    var set = new Set(getLS(SELECTEDSET_KEY));
    if (set === null) {
        set = new Set();
    }
    currentSelectedSet = set;
}

function StoreSelectedSet() {
    setLS(SELECTEDSET_KEY, Array.from(currentSelectedSet));
}