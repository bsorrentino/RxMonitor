var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
// Time of one step
var stepInMs = 200;
var isPaused = false;
function delayAsync(delayInMs, value) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(value);
        }, delayInMs);
    });
}
function filterTriangles(char, useAsync) {
    var errorRate = 0;
    if (Math.random() < errorRate)
        throw new Error("Funny error in filter");
    var delayResultAsync = function (input) {
        var resolveWith = input[input.length - 1];
        if (useAsync) {
            return delayAsync(stepInMs * (input.length - 1), resolveWith === '✓');
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
;
function fill(char, useAsync) {
    var delayResultAsync = function (input) {
        var resolveWith = input[input.length - 1];
        if (useAsync) {
            return delayAsync(stepInMs * (input.length - 1), resolveWith);
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
;
var marbleDiagram;
function createLogger() {
    // Sampler ticker
    var ticker = Observable.interval(stepInMs)
        .filter(function () { return !isPaused; });
    // Sample items
    var logger = new SamplerLogger(ticker);
    // Draw marble diagram
    var div = document.getElementById("marble");
    marbleDiagram = showMarbles(div, logger.getSamples());
    return logger;
}
;
var unsubscribe;
function selectExample(exampleCode) {
    if (exampleCode === void 0) { exampleCode = 'shapes'; }
    if (marbleDiagram)
        marbleDiagram.clear();
    stopExample();
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    // Select in combobox
    var testsEl = document.getElementById('sampleNbr');
    testsEl.value = exampleCode;
    var exampleInfoEl = document.getElementById('example__info');
    if (exampleInfoEl)
        exampleInfoEl.innerHTML = example.infoHtml || '';
    var startEl = document.getElementById('example__start');
    startEl.classList.toggle('only-stop', !!example.onlyStop);
    var startButtonEl = document.getElementById('example__startButton');
    startButtonEl.style.display = '';
    // Auto start?
    if (example.autoPlay) {
        startExample();
        startEl.checked = true;
    }
    else {
        startEl.checked = false;
    }
    return __assign({ code: exampleCode }, example);
}
function startExample() {
    if (marbleDiagram)
        marbleDiagram.clear();
    isPaused = false;
    var example = getExample();
    if (example) {
        // Add to history
        window.history.pushState(example.code, example.name, "#" + example.code);
        // Google analytics
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'RX Marble Sample',
            eventAction: 'START',
            eventLabel: example.name
        });
        unsubscribe = example.exec(function () {
            // Complete stops before sample is completed
            setTimeout(function () {
                stopExample();
                var startEl = document.getElementById('example__start');
                startEl.checked = false;
            }, stepInMs + 50);
        });
    }
}
function stopExample() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
    }
    isPaused = true;
}
function pauzeExample() {
    isPaused = true;
}
function resumeExample() {
    if (!unsubscribe)
        startExample();
    isPaused = false;
}
function getExample() {
    var testsEl = document.getElementById('sampleNbr');
    var exampleCode = testsEl.options[testsEl.selectedIndex].value;
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    return __assign({ code: exampleCode }, example);
}
window.addEventListener('load', function () {
    var infoEl = document.getElementById('info');
    var exampleEl = document.getElementById('example');
    var infoButtonEl = document.getElementById('info-button');
    var testsEl = document.getElementById('sampleNbr');
    var startEl = document.getElementById('example__start');
    var backButtonEl = document.getElementById('info__back');
    // Enable logging
    Observable.logger = createLogger();
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
    testsEl.onchange = function () {
        var exampleCode = testsEl.options[testsEl.selectedIndex].value;
        var example = selectExample(exampleCode);
        // Replace url
        window.history.replaceState(example.code, example.name, "#" + example.code);
    };
    // Start Button
    startEl.checked = false;
    startEl.onclick = function () {
        var example = getExample();
        if (example && !example.onlyStop) {
            isPaused ? resumeExample() : pauzeExample();
        }
        else {
            isPaused ? startExample() : stopExample();
        }
    };
    // Info Button
    infoButtonEl.addEventListener('click', function () {
        if (infoEl.classList.contains('hide')) {
            stopExample();
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
    window.onpopstate = function (e) {
        if (e.state)
            selectExample(e.state);
    };
});
//# sourceMappingURL=index.js.map