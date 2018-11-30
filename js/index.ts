
// Time of one step
var stepInMs = 200;
var isPaused = false;


function delayAsync(delayInMs:number, value:any):Promise<any> {
    return new Promise( resolve => {
        setTimeout( () => {
            resolve(value);
        }, delayInMs);
    });
}

function filterTriangles(char:string, useAsync:boolean):boolean|Promise<boolean> {
    var errorRate = 0;
    if (Math.random() < errorRate)
        throw new Error("Funny error in filter");
    var delayResultAsync = (input:any) => {
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

function fill(char:string, useAsync:boolean):any|Promise<any> {
    var delayResultAsync = (input:any) => {
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

var marbleDiagram:any;

declare function showMarbles(div:Element, samples$:Observable, options?:any):any;

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
var unsubscribe:any;

function selectExample(exampleCode = 'shapes') {
    if (marbleDiagram)
        marbleDiagram.clear();
    stopExample();
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    // Select in combobox
    var testsEl = document.getElementById('sampleNbr') as HTMLInputElement;
    testsEl.value = exampleCode;
    var exampleInfoEl = document.getElementById('example__info');
    if (exampleInfoEl)
        exampleInfoEl.innerHTML = example.infoHtml || '';
    var startEl = document.getElementById('example__start') as HTMLInputElement;
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
    return Object.assign({ code: exampleCode }, example);
}
function startExample() {
    if (marbleDiagram)
        marbleDiagram.clear();
    isPaused = false;
    var example = getExample();
    if (example) {
        // Add to history
        window.history.pushState(example.code, example.name, "#" + example.code);
        unsubscribe = example.exec(function () {
            // Complete stops before sample is completed
            setTimeout(function () {
                stopExample();
                var startEl = document.getElementById('example__start') as HTMLInputElement;;
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
    var testsEl = document.getElementById('sampleNbr') as HTMLSelectElement;;
    var exampleCode = testsEl.options[testsEl.selectedIndex].value;
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    return Object.assign({ code: exampleCode }, example);
}
window.addEventListener('load', function () {
    var infoEl = document.getElementById('info');
    var exampleEl = document.getElementById('example');
    var infoButtonEl = document.getElementById('info-button');
    var testsEl = document.getElementById('sampleNbr') as HTMLSelectElement;
    var startEl = document.getElementById('example__start') as HTMLInputElement;
    var backButtonEl = document.getElementById('info__back');
    // Enable logging
    Observable.logger = createLogger();
    var groupEls:Array<HTMLOptGroupElement> = [];
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