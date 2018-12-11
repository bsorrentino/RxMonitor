"use strict";
var marbles;
var currentExample;
function delayAsync(delayInMs, value) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, delayInMs);
    });
}
function filterTriangles(char, useAsync) {
    var errorRate = 0;
    if (Math.random() < errorRate)
        throw new Error("Funny error in filter");
    var delayResultAsync = (input) => {
        var resolveWith = input[input.length - 1];
        if (useAsync) {
            return delayAsync(marbles.stepInMs * (input.length - 1), resolveWith === '✓');
        }
        else {
            return resolveWith === '✓';
        }
    };
    switch (char) {
        case '□': return delayResultAsync('╰─────────✖');
        case '△': return delayResultAsync('╰──────────────✓');
        case '○': return delayResultAsync('╰──✖');
        case '▷': return delayResultAsync('╰────✓');
        case '☆': return delayResultAsync('╰──────✖');
        case '■': return delayResultAsync('╰─────────✖');
        case '▲': return delayResultAsync('╰──────✓');
        case '●': return delayResultAsync('╰─────────────✖');
        case '★': return delayResultAsync('╰─────✖');
        case '▶': return delayResultAsync('╰─✓');
        default: {
            if (useAsync) {
                return new Promise(function (_, reject) { return reject("Unknown char: " + char); });
            }
            else {
                throw new Error("Unknown char: " + char);
            }
        }
    }
}
function fill(char, useAsync) {
    var delayResultAsync = (input) => {
        var resolveWith = input[input.length - 1];
        if (useAsync) {
            return delayAsync(marbles.stepInMs * (input.length - 1), resolveWith);
        }
        else {
            return resolveWith;
        }
    };
    switch (char) {
        case '□': return delayResultAsync('╰─────────■');
        case '△': return delayResultAsync('╰──────────────▲');
        case '○': return delayResultAsync('╰──●');
        case '▷': return delayResultAsync('╰───▶');
        case '☆': return delayResultAsync('╰───★');
        case '■': return delayResultAsync('■');
        case '▲': return delayResultAsync('▲');
        case '●': return delayResultAsync('●');
        case '★': return delayResultAsync('★');
        case '▶': return delayResultAsync('▶');
        default: {
            if (useAsync) {
                return new Promise(function (_, reject) { return reject("Unknown char: " + char); });
            }
            else {
                throw new Error("Unknown char: " + char);
            }
        }
    }
}
function selectExample(exampleCode = 'shapes') {
    console.log("selectExample", exampleCode);
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    marbles.diagram.clear();
    // Select in combobox
    let testsEl = document.getElementById('sampleNbr');
    testsEl.value = exampleCode;
    let exampleInfoEl = document.getElementById('example__info');
    if (exampleInfoEl)
        exampleInfoEl.innerHTML = example.infoHtml || '';
    let startEl = document.getElementById('example__start');
    startEl.classList.toggle('only-stop', !!example.onlyStop);
    let startButtonEl = document.getElementById('example__startButton');
    startButtonEl.style.display = '';
    if (currentExample)
        currentExample.stop();
    let result = Object.assign({ code: exampleCode }, example);
    // Add to history
    window.history.pushState(exampleCode, example.name, "#" + exampleCode);
    currentExample = marbles.startExample(result, () => {
        let startEl = document.getElementById('example__start');
        ;
        startEl.checked = false;
    });
    // Auto start?
    startEl.checked = example.autoPlay;
    return result;
}
function getCurrentExampleCode() {
    let testsEl = document.getElementById('sampleNbr');
    ;
    return testsEl.options[testsEl.selectedIndex].value;
}
window.addEventListener('load', function () {
    var infoEl = document.getElementById('info');
    var exampleEl = document.getElementById('example');
    var infoButtonEl = document.getElementById('info-button');
    var testsEl = document.getElementById('sampleNbr');
    var startEl = document.getElementById('example__start');
    var backButtonEl = document.getElementById('info__back');
    // Enable logging
    marbles = rxmarbles.create();
    var groupEls = [];
    // Fill
    Object.keys(examples).forEach(function (exampleCode) {
        var example = examples[exampleCode];
        var optionsEl = document.createElement("option");
        optionsEl.value = exampleCode;
        optionsEl.innerText = examples[exampleCode].name;
        if (example.group) {
            var optGroupEl = groupEls.filter(function (g) { return g.label === example.group; })[0];
            if (!optGroupEl) {
                optGroupEl = document.createElement("optgroup");
                optGroupEl.label = example.group;
                groupEls.push(optGroupEl);
                testsEl.appendChild(optGroupEl);
            }
            optGroupEl.appendChild(optionsEl);
        }
        else {
            testsEl.options.add(optionsEl);
        }
    });
    // Combobox change
    testsEl.onchange = () => {
        var exampleCode = testsEl.options[testsEl.selectedIndex].value;
        var example = selectExample(exampleCode);
        // Replace url
        window.history.replaceState(example.code, example.name, "#" + example.code);
    };
    // Start Button
    startEl.checked = false;
    startEl.onclick = () => {
        if (currentExample.example.onlyStop) {
            if (currentExample.isPaused) {
                currentExample = marbles.startExample(currentExample.example);
            }
            else
                currentExample.stop();
        }
        else {
            return currentExample.isPaused ? currentExample.resume() : currentExample.pause();
        }
    };
    // Info Button
    infoButtonEl.addEventListener('click', function () {
        if (infoEl.classList.contains('hide')) {
            currentExample.stop();
            infoEl.classList.remove('hide');
            exampleEl.classList.add('hide');
        }
        else {
            infoEl.classList.add('hide');
            exampleEl.classList.remove('hide');
            selectExample();
        }
    });
    // Back Button
    backButtonEl.addEventListener('click', function () {
        infoEl.classList.add('hide');
        exampleEl.classList.remove('hide');
        selectExample();
    });
    // Load Hash
    if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        selectExample(hash);
    }
    else {
        selectExample();
    }
    // Detect forward backward button
    window.onpopstate = (e) => {
        if (e.state)
            selectExample(e.state);
    };
});
//# sourceMappingURL=index.js.map
