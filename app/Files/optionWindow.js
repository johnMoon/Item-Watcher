var defaultTransparency = 0.8; // make sure this is the same as the css
var defaultFrequency = 10000; // make sure this is the same as option/watch


function changeTransparency(value) {
    window.localStorage.setItem("transparency-alpha", value);

};

function setDefaultTransparency() {
    var trans = window.localStorage.getItem("transparency-alpha");
    if (trans) {
        // there was a value before
        document.getElementById("range-transparency").value = trans;
    } else {
        window.localStorage.setItem("transparency-alpha", defaultTransparency);
        document.getElementById("range-transparency").value = defaultTransparency;
    }
};




//// frequency
function changeFrequency(value) {

    window.localStorage.setItem('frequency', value);
};

function setDefaultFrequency() {

    var prevFrequency = window.localStorage.getItem("frequency");
    if (prevFrequency) {
        // there was item list before

        document.getElementById("frequency-changer").value = prevFrequency;
    } else {
        document.getElementById("frequency-changer").value = defaultFrequency;
    }

};

$(function() {

    setDefaultTransparency()
    setDefaultFrequency()
});