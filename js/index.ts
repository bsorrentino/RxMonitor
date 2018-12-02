

var marbles:rxmarbles.RxMarbles;
var currentExample:rxmarbles.ExampleState;

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

function fill(char:string, useAsync:boolean):any|Promise<any> {
    var delayResultAsync = (input:any) => {
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
    console.log( "selectExample", exampleCode );
    var example = examples[exampleCode];
    if (!example)
        throw new Error("Unknown example: '" + exampleCode + "'");
    
    marbles.diagram.clear();

    // Select in combobox
    let testsEl = document.getElementById('sampleNbr') as HTMLInputElement;
    testsEl.value = exampleCode;

    let exampleInfoEl = document.getElementById('example__info');
    if (exampleInfoEl)
        exampleInfoEl.innerHTML = example.infoHtml || '';

    let startEl = document.getElementById('example__start') as HTMLInputElement;
    startEl.classList.toggle('only-stop', !!example.onlyStop);

    let startButtonEl = document.getElementById('example__startButton');
    startButtonEl.style.display = '';

    if( currentExample ) currentExample.stop();    

    let result = Object.assign({ code: exampleCode }, example);
    currentExample = marbles.startExample( result )
    //console.log( "currentExample", currentExample);
    // Auto start?
    startEl.checked = example.autoPlay;
    return result;
}

function getCurrentExampleCode() {
    let testsEl     = document.getElementById('sampleNbr') as HTMLSelectElement;;
    return testsEl.options[testsEl.selectedIndex].value;
}

window.addEventListener('load', function () {
    var infoEl          = document.getElementById('info');
    var exampleEl       = document.getElementById('example');
    var infoButtonEl    = document.getElementById('info-button');
    var testsEl         = document.getElementById('sampleNbr') as HTMLSelectElement;
    var startEl         = document.getElementById('example__start') as HTMLInputElement;
    var backButtonEl    = document.getElementById('info__back');
    // Enable logging
    marbles = rxmarbles.create();

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
    testsEl.onchange = () => {
        var exampleCode = testsEl.options[testsEl.selectedIndex].value;
        var example = selectExample(exampleCode);
        // Replace url
        window.history.replaceState(example.code, example.name, "#" + example.code);
    };
    // Start Button
    startEl.checked = false;
    startEl.onclick = () => { 

        if( currentExample.example.onlyStop ) {
            
            if( currentExample.isPaused ) {
                currentExample = marbles.startExample( currentExample.example );
            }
            else 
                currentExample.stop(); 
        }
        else {
            return currentExample.isPaused ? currentExample.resume( ) : currentExample.pause();

        }
             
    }

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