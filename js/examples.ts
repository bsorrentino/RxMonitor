
declare var currentExample:rxmarbles.ExampleState;

interface Example {
    name:string;
    group:string;
    autoPlay?:boolean;
    exec:( ( p?:(() => void)) => () => void );
    infoHtml:string;
    onlyStop?:boolean;
}

interface Examples {

    [name:string]:Example;
}

type Shape = string;


function randomStreamObservable( slowDownFactor = 1, name = 'shapes$', values = ['□', '△', '○', '▷', '☆']) {
    return new Observable(randomStreamProducer(slowDownFactor, values), name);
}

function randomStreamProducer(slowDownFactor = 1, values = ['□', '△', '○', '▷', '☆']) {
    // ['□', '△', '○', '▷', '☆', '■', '▲', '●', '▶', '★']
    return function (observer:Observer) {
        // Get Random Value
        function getRandomChar() {
            return values[Math.floor(Math.random() * values.length)];
        }
        // Loop with random delay
        var cancelationToken:number;
        function randomLoop() {
            var delayInMs = marbles.stepInMs * (Math.round(Math.random() * 10 * slowDownFactor) + 1);
            cancelationToken = setTimeout( () => {
                if (!currentExample.isPaused)
                    observer.next(getRandomChar());
                if (cancelationToken)
                    randomLoop(); // Canceled in next handler? Recursive, normally TCO should be possible
            }, delayInMs);
        }
        // Start
        randomLoop();
        // Unsubscribe
        return () => {
            if (cancelationToken) {
                clearTimeout(cancelationToken);
                cancelationToken = 0;
            }
        };
    };
}
function combineShapeAndFill(fill:string, shape:Shape) {
    var noneFilledShapes = ['□', '△', '○', '▷', '☆'];
    var filledShapes = ['■', '▲', '●', '▶', '★'];
    
    var isFilled = (val:string) => filledShapes.indexOf(val) > -1;

    var getShapeIndex = (val:string) => {
        var index = filledShapes.indexOf(val);
        return index > -1 ? index : noneFilledShapes.indexOf(val);
    };
    var shapeIndex = getShapeIndex(shape);
    return isFilled(fill) ? filledShapes[shapeIndex] : noneFilledShapes[shapeIndex];
}
/** Simulates an AJAX request */
function getFilledShapeAsync(shape:Shape) {
    return delayAsync(marbles.stepInMs + 50 + Math.random() * 2300, fill(shape, false));
}
var examples:Examples = {
    'shapes': {
        name: "shapes$",
        group: 'Sample streams',
        autoPlay: true,
        exec: () => randomStreamObservable().subscribe(),
        infoHtml: "This is an Observable that produces one of these shapes: \u25A1, \u25B3, \u25CB, \u25B7, \u2606<br/>\nIt is used in these examples.\n<pre>shapes$\n  .subscribe();</pre>"
    },
    'keyup': {
        name: "keyup$",
        group: 'Sample streams',
        autoPlay: true,
        exec: function () {
            return Observable.fromEvent(window, 'keyup')
                .map(function (e) { return String.fromCharCode(e.keyCode || e.which); })
                .subscribe();
        },
        infoHtml: "A stream from key presses.<br/>Press any key to test...\n<pre>Observable.fromEvent<KeyboardEvent>(window, 'keyup')\n  .map(e => String.fromCharCode(e.which))\n  .subscribe();"
    },
    'mouseX': {
        name: "mouseX$",
        group: 'Sample streams',
        autoPlay: true,
        exec: function () {
            return Observable.fromEvent(window, 'mousemove')
                .map(function (e) { return e.pageX; })
                .subscribe();
        },
        infoHtml: "A stream based on the X coordinate of mouse move events.<br/>Move the mouse to test...\n<pre>Observable.fromEvent<MouseEvent>(window, 'mousemove')\n  .map(e => e.pageX)\n  .subscribe();"
    },
    //==============================
    // Creation
    //------------------------------
    'never': {
        name: "never",
        group: 'Creating Observables',
        exec:  () => Observable.never().subscribe(),
        infoHtml: "Creates an Observable that emits no items to the Observer.\n<pre>Observable.never())\n  .subscribe();</pre>"
    },
    'empty': {
        name: "empty",
        group: 'Creating Observables',
        exec: function (done) {
            return Observable.empty()
                .subscribe({ complete: done });
        },
        infoHtml: "Creates an Observable that emits no items to the Observer and immediately emits a complete notification.\n<pre>Observable.empty()\n  .subscribe();</pre>"
    },
    'single': {
        name: "single",
        group: 'Creating Observables',
        exec: function (done) {
            return Observable.single('☆')
                .subscribe({ complete: done });
        },
        infoHtml: "Produce a single value and completes the stream.\n<pre>Observable.single('\u2606')\n  .subscribe();</pre>"
    },
    'of': {
        name: "of",
        group: 'Creating Observables',
        exec: function (done) {
            return Observable.of('☆', '○')
                .subscribe({ complete: done });
        },
        infoHtml: "Creates an Observable that emits some values you specify as arguments, immediately one after the other, and then emits a complete notification.\n<pre>Observable.of('\u2606', '\u25CB')\n  .subscribe();</pre>"
    },
    'throw': {
        name: "throw",
        group: 'Creating Observables',
        exec: function (done) {
            return Observable.throw(new Error("Aauwch"))
                .subscribe({ complete: done });
        },
        infoHtml: "Creates an Observable that emits no items to the Observer and immediately emits an error notification.\n<pre>Observable.throw(new Error(\"Aauwch\"))\n  .subscribe();</pre>"
    },
    'fromPromise': {
        name: "fromPromise",
        group: 'Creating Observables',
        exec: function (done) {
            return Observable.fromPromise(getFilledShapeAsync('☆'))
                .subscribe({ complete: done });
        },
        infoHtml: "Converts a Promise to an Observable.\n<pre>Observable.fromPromise(getFilledShapeAsync('\u2606'))\n  .subscribe();</pre>"
    },
    'interval': {
        name: "interval",
        group: 'Creating Observables',
        exec: function () {
            return Observable.interval(1000)
                .subscribe();
        },
        infoHtml: "Creates an Observable that emits sequential numbers every specified interval of time\n<p>Example: Produce a value each second.</p>\n<pre>Observable.interval(1000)\n  .subscribe();</pre>",
        onlyStop: true
    },
    //==============================
    // Filtering
    //------------------------------
    'take': {
        name: "take",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .take(10)
                .subscribe({ complete: done });
        },
        infoHtml: "Emits only the first X values emitted by the source Observable.\n<p>Example: Get 10 values and complete.</p>\n<pre>shapes$\n  .take(10)\n  .subscribe();</pre>"
    },
    'takeWhile': {
        name: "takeWhile",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .takeWhile(function (v) { return v !== '☆'; })
                .subscribe({ complete: done });
        },
        infoHtml: "Emits values emitted by the source Observable so long as each value satisfies the given predicate, and then completes as soon as this predicate is not satisfied.\n<p>Example: Get values until we get a '\u2606':</p>\n<pre>shapes$\n  .takeWhile(shape => shape !== '\u2606')\n  .subscribe();</pre>"
    },
    'takeUntil': {
        name: "takeUntil",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .takeUntil(Observable.interval(5000))
                .subscribe({ complete: done });
        },
        infoHtml: "Emits the values emitted by the source Observable until a notifier Observable emits a value.\n<p>Example: Start observable and stop it after 5 seconds:</p>\n<pre>shapes$\n  .takeUntil(Observable.interval(5000))\n  .subscribe();</pre>"
    },
    'skip': {
        name: "skip",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .skip(3)
                .take(5)
                .subscribe({ complete: done });
        },
        infoHtml: "Returns an Observable that skips the first X items emitted by the source Observable.\n<p>Example: Skip the first 3 values and only get the next 5 values:</p>\n<pre>shapes$\n  .skip(3)\n  .take(5)\n  .subscribe();</pre>"
    },
    'filter': {
        name: "filter",
        group: 'Filtering',
        exec: (done) => 
            randomStreamObservable()
                .filter( v => filterTriangles(v, false) as boolean )
                .subscribe({ complete: done })
        ,
        infoHtml: "Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.\n<p>Example: Only allow triangles:</p>\n<pre>shapes$\n  .filter(shape => shape === '\u25B3' || shape === '\u25B7')\n  .subscribe();</pre>"
    },
    'distinct': {
        name: "distinct",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .distinct()
                .take(5)
                .subscribe({ complete: done });
        },
        infoHtml: "Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.</p>\n<pre>shapes$\n  .distinct()\n  .take(5)\n  .subscribe();</pre>"
    },
    'distinctUntilChanged': {
        name: "distinctUntilChanged",
        group: 'Filtering',
        exec: function (done) {
            return randomStreamObservable()
                .distinctUntilChanged()
                .subscribe({ complete: done });
        },
        infoHtml: "Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.\n<pre>shapes$\n  .distinctUntilChanged()\n  .subscribe();</pre>"
    },
    //==============================
    // Projections
    //------------------------------
    'map': {
        name: "map",
        group: 'Projections',
        exec: function () {
            return randomStreamObservable()
                .map(function (v) { return fill(v, false); })
                .subscribe();
        },
        infoHtml: "Applies a given projection function to each value emitted by the source Observable, and emits the resulting values as an Observable.\n<p>Example: Color all shapes:</p>\n<pre>shapes$\n  .map(shape => fill(shape))\n  .subscribe();</pre>"
    },
    'scan': {
        name: "scan",
        group: 'Projections',
        exec: function () {
            return randomStreamObservable(1, 'numbers$', ['0', '1', '2', '3', '4'])
                .scan(function (prev, val) { return (prev || 0) + parseInt(val, 10); }, 0)
                .subscribe();
        },
        infoHtml: "Applies an accumulator function over the source Observable, and returns each intermediate result, with an optional seed value.\n<p>Example: Calculate sum when we receive a values</p>\n<pre>numbers$\n  .scan((prev, val) => prev + next)\n  .subscribe();</pre>"
    },
    'catch': {
        name: "catch",
        group: 'Projections',
        exec: function (done) {
            return Observable.throw(new Error("Aauwch"))
                .catch(function () { return Observable.single('★'); })
                .subscribe({ complete: done });
        },
        infoHtml: "Catches errors on the observable to be handled by returning a new observable or throwing an error.\n<p>Example:Conver an error to a value.</p>\n<pre>Observable.throw(new Error(\"Aauwch\"))\n  .catch(() => Observable.single('\u2605'))\n  .subscribe();</pre>"
    },
    //==============================
    // On Complete
    //------------------------------
    'last': {
        name: "last",
        group: 'On complete',
        exec: function (done) {
            return randomStreamObservable()
                .take(5)
                .last()
                .subscribe({ complete: done });
        },
        infoHtml: "Returns an Observable that emits only the last item emitted by the source Observable.\n<p>Example: Get the fifth value:</p>\n<pre>shapes$\n  .take(5)\n  .last()\n  .subscribe();</pre>"
    },
    'min': {
        name: "min",
        group: 'On complete',
        exec: function (done) {
            return randomStreamObservable(1, 'numbers$', ['0', '1', '2', '3', '4'])
                .take(5)
                .min(function (a, b) {
                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            })
                .subscribe({ complete: done });
        },
        infoHtml: "The Min operator operates on an Observable that emits numbers (or items that can be compared with a provided function), and when source Observable completes it emits a single item: the item with the smallest value.\n<p>Example: Gets the lowest value emitted:</p>\n<pre>numbers$\n  .take(5)\n  .min()\n  .subscribe();</pre>"
    },
    'reduce': {
        name: "reduce",
        group: 'On complete',
        exec: function (done) {
            return randomStreamObservable(1, 'numbers$', ['0', '1', '2', '3', '4'])
                .take(5)
                .reduce(function (prev, val) { return (prev || 0) + parseInt(val, 10); }, 0)
                .subscribe({ complete: done });
        },
        infoHtml: "Applies an accumulator function over the source Observable, and returns the accumulated result when the source completes, given an optional seed value.\n<p>Example: Calculate sum of all received values when stream completes:</p>\n<pre>numbers$\n  .take(5)\n  .reduce((prev, val) => prev + val, 0)\n  .subscribe();</pre>"
    },
    //==============================
    // Combining Observables
    //------------------------------
    'startWith': {
        name: "startWith",
        group: 'Combining',
        exec: function () {
            return randomStreamObservable()
                .startWith('★')
                .subscribe();
        },
        infoHtml: "Returns an Observable that emits the items you specify as arguments before it begins to emit items emitted by the source Observable.\n<pre>shapes\n  .startWith('\u2605')\n  .subscribe();</pre>"
    },
    'merge': {
        name: "merge",
        group: 'Combining',
        exec: function () {
            return randomStreamObservable(2, 'shapes2$', ['■', '▲', '●', '▶', '★'])
                .merge(randomStreamObservable(2, 'shapes1$'))
                .subscribe();
        },
        infoHtml: "Creates an output Observable which concurrently emits all values from every given input Observable.\n<pre>Observable.merge(shapes1$, shapes2$)\n  .subscribe();</pre>"
    },
    'concat': {
        name: "concat",
        group: 'Combining',
        exec: function (done) {
            return randomStreamObservable(2, 'shapes1$')
                .take(5)
                .concat(randomStreamObservable(2, 'shapes2$', ['■', '▲', '●', '▶', '★']).take(5))
                .subscribe({ complete: done });
        },
        infoHtml: "Creates an output Observable which sequentially emits all values from every given input Observable after the current Observable.\n<pre>Observable.merge(shapes1$.take(5), shapes2$.take(5))\n  .subscribe();</pre>"
    },
    'withLatestFrom': {
        name: "withLatestFrom",
        group: 'Combining',
        exec: function () {
            return randomStreamObservable(3)
                .withLatestFrom(randomStreamObservable(3, "color$", ['□', '■']), function (shape, fill) { return combineShapeAndFill(fill, shape); })
                .subscribe();
        },
        infoHtml: "Combines the source Observable with other Observables to create an Observable whose values are calculated from the latest values of each, only when the source emits.\n<p>Example: When a new shape is received, combine it with the latest value from the color stream:</p>\n<pre>shapes$.withLatestFrom(color$, (shape, color) => fillShape(shape, color))\n  .subscribe();</pre>"
    },
    'combineLatest': {
        name: "combineLatest",
        group: 'Combining',
        exec: function () {
            return randomStreamObservable(3, "color$", ['□', '■'])
                .combineLatest(randomStreamObservable(3), combineShapeAndFill)
                .subscribe();
        },
        infoHtml: "Combines multiple Observables to create an Observable whose values are calculated from the latest values of each of its input Observables.\n<p>Example: When a new values are emitted on any stream, combine the latest values:</p>\n<pre>Observable.combineLatest(shapes$, color$, (shape, color) => fillShape(shape, color))\n  .subscribe();</pre>"
    },
    'zip': {
        name: "zip",
        group: 'Combining',
        exec: function () {
            return randomStreamObservable(3, "color$", ['□', '■'])
                .zip(randomStreamObservable(3), combineShapeAndFill)
                .subscribe();
        },
        infoHtml: "Combines multiple Observables to create an Observable whose values are calculated from the input values with the same index.\n<pre>Observable.zip(shapes$, color$, (shape, color) => fillShape(shape, color))\n  .subscribe();</pre>"
    },
    //==============================
    // Time based
    //------------------------------
    'delay': {
        name: "delay",
        group: 'Time based',
        exec: function () {
            return randomStreamObservable()
                .delay(1000)
                .subscribe();
        },
        infoHtml: "Delays the emission of items from the source Observable by a given timeout.\n<p>Example: Delay all values with 1 second:</p>\n<pre>shapes$\n  .delay(1000)\n  .subscribe();</pre>"
    },
    'sampleTime': {
        name: "sampleTime",
        group: 'Time based',
        exec: function () {
            return randomStreamObservable()
                .sampleTime(1000)
                .subscribe();
        },
        onlyStop: true,
        infoHtml: "Emit the most recent value within periodic time intervals.\n<p>Example: Emit each second the latest value received in that sample period.</p>\n<pre>shapes$\n  .sampleTime(1000)\n  .subscribe();</pre>"
    },
    'bufferTime': {
        name: "bufferTime",
        group: 'Time based',
        exec: function () {
            return randomStreamObservable()
                .bufferTime(1000)
                .subscribe();
        },
        onlyStop: true,
        infoHtml: "Buffers the source Observable values for a specific time period.\n<p>Example: Emit each second the received values.</p>\n<pre>shapes$\n  .bufferTime(1000)\n  .subscribe();</pre>"
    },
    'throttleTime': {
        name: "throttleTime",
        group: 'Time based',
        exec: function () {
            return randomStreamObservable()
                .throttleTime(1000)
                .subscribe();
        },
        infoHtml: "Emits a value from the source Observable, then ignores subsequent source values for X milliseconds, then repeats this process.\n<p>Example: Reduce the frequency to at most 1 value/second by skipping values comming to fast</p>\n<pre>shapes$\n  .throttleTime(1000)\n  .subscribe();</pre>"
    },
    'debounceTime': {
        name: "debounceTime",
        group: 'Time based',
        exec: function () {
            return randomStreamObservable()
                .debounceTime(1000)
                .subscribe();
        },
        infoHtml: "Emits a value from the source Observable only after a particular time span has passed without another source emission.\n<p>Example: AutoCompletion. When user is typing a word, wait until user stops typing for 1 second before handling the new word.</p>\n<pre>shapes$\n  .debounceTime(1000)\n  .subscribe();</pre>"
    },
    //==============================
    // Higher Order
    //------------------------------
    'mergeMap': {
        name: "mergeMap",
        group: 'Higher Order Observables',
        exec: function () {
            return randomStreamObservable()
                .mergeMap(function (shape) { return Observable.fromPromise(getFilledShapeAsync(shape)); })
                .subscribe();
        },
        infoHtml: "Projects each source value to an Observable which is merged in the output Observable.\n<p>Example: When a new shape is received, call and AJAX function to get a filled version:</p>\n<pre>shapes$\n  .mergeMap(shape => Observable.fromPromise(getFilledShapeAsync(shape)))\n  .subscribe();</pre>"
    },
    'concatMap': {
        name: "concatMap",
        group: 'Higher Order Observables',
        exec: function () {
            return randomStreamObservable(2)
                .concatMap(function (shape) { return Observable.fromPromise(getFilledShapeAsync(shape)); })
                .subscribe();
        },
        infoHtml: "Projects each source value to an Observable which is merged in the output Observable, in a serialized fashion waiting for each one to complete before merging the next.\n<p>Example: When a new shape is received, call and AJAX function to get a filled version and ensure the order by starting the next Observable when the previous is completed.</p>\n<pre>shapes$\n  .concatMap(shape => Observable.fromPromise(getFilledShapeAsync(shape)))\n  .subscribe();</pre>"
    },
    'switchMap': {
        name: "switchMap",
        group: 'Higher Order Observables',
        exec: function () {
            return randomStreamObservable()
                .switchMap(function (shape) { return Observable.fromPromise(getFilledShapeAsync(shape)); })
                .subscribe();
        },
        infoHtml: "Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.\n<p>Example: When a new shape is received, call and AJAX function to get a filled version and ensure only the result of the last request is emitted.</p>\n<pre>shapes$\n  .switchMap(shape => Observable.fromPromise(getFilledShapeAsync(shape)))\n  .subscribe();</pre>"
    },
    'exhaustMap': {
        name: "exhaustMap",
        group: 'Higher Order Observables',
        exec: function () {
            return randomStreamObservable()
                .exhaustMap(function (shape) { return Observable.fromPromise(getFilledShapeAsync(shape)); })
                .subscribe();
        },
        infoHtml: "Projects each source value to an Observable which is merged in the output Observable only if the previous projected Observable has completed.\n<p>Example: When a new shape is received, call and AJAX function to get a filled version and ignore new shapes if AJAX call not completed.</p>\n<pre>shapes$\n  .exhaustMap(shape => Observable.fromPromise(getFilledShapeAsync(shape)))\n  .subscribe();</pre>"
    },
    //==============================
    // Samples
    //------------------------------
    'stopwatch-start-pauze': {
        name: "Stopwatch - Start/Pauze",
        group: 'Samples',
        onlyStop: true,
        autoPlay: true,
        exec: function () {
            var startEl = document.getElementById('stopwatch__start-pause');
            var valueEl = document.getElementById('stopwatch__value');
            // After restart reset values
            startEl.innerText = '►';
            valueEl.innerText = '0';
            var updatePauseButton = (isOn:boolean) => {
                startEl.innerText = isOn ? '❙❙' : '►';
                return isOn;
            };
            var updateValue = (value:any ) => {
                valueEl.innerText = value.toString();
            };
            return Observable.fromEvent(startEl, 'click')
                .scan(function (prev) { return updatePauseButton(!prev); }, false) // Toggle
                .switchMap(function (isOn) { return isOn ? Observable.interval(1000) : Observable.never(); })
                .scan(function (prev) { return prev + 1; }, 0)
                .subscribe(updateValue);
        },
        infoHtml: "This sample will start and pause a timer.<br/><br/>\n        <div>\n            <button id='stopwatch__start-pause' autofocus class='button'>\u25BA</button>\n            <span id='stopwatch__value'>0</span>\n        </div>\n\n        <pre>Observable\n  .fromEvent(startEl, 'click')\n  .scan(prev => !prev, false) // Toggle\n  .switchMap(isOn => isOn ? Observable.interval(1000) : Observable.never<number>())\n  .scan(prev => prev + 1, 0); // Count total received values\n  .subscribe(updateValue);</pre>"
    },
    'stopwatch-start-stop': {
        name: "Stopwatch - Start/Stop",
        group: 'Samples',
        onlyStop: true,
        autoPlay: true,
        exec: function () {
            var startEl = document.getElementById('stopwatch__start');
            var stopEl = document.getElementById('stopwatch__reset');
            var valueEl = document.getElementById('stopwatch__value');
            // After restart reset values
            valueEl.innerText = '0';
            var updateValue = (value:any) => {
                valueEl.innerText = value.toString();
            };
            var stop$ = Observable.fromEvent(stopEl, 'click');
            return Observable.fromEvent(startEl, 'click')
                .exhaustMap(function () { return Observable.interval(1000) // Don't start bnew when previous not completed
                .map(function (i) { return i + 1; })
                .takeUntil(stop$)
                .concat(Observable.single(0)); })
                .subscribe(updateValue);
        },
        infoHtml: "This sample will start and reset a timer.<br/><br/>\n        <div>\n            <button id='stopwatch__start' autofocus class='button'>\u25BA</button>\n            <button id='stopwatch__reset' class='button'>\u25A0</button>\n            <span id='stopwatch__value'>0</span>\n        </div>\n\n        <pre>Observable\n  .fromEvent(startEl, 'click')\n  .exhaustMap(() => Observable // Don't start bnew when previous not completed\n    .interval(1000)\n    .map(i => i + 1)\n    .takeUntil(stop$)\n    .concat(Observable.single(0)) // Reset with 0 value\n  )\n  .subscribe(updateValue);</pre>"
    },
    'autocomplate': {
        name: "Auto completion",
        group: 'Samples',
        onlyStop: true,
        autoPlay: true,
        exec: function () {
            var inputEl = document.getElementById('autocomplete') as HTMLInputElement;
            var resultEl = document.getElementById('autocomplete-result');
            // After restart reset values
            inputEl.value = '';
            resultEl.style.color = '';
            resultEl.innerHTML = '&nbsp;';
            function getGitHubStars(term:any) {
                if (term) {
                    return window.fetch("https://api.github.com/search/repositories?q=" + encodeURIComponent(term) + "&sort=stars")
                        .then(function (response) { return response.json(); })
                        .then(function (result) {
                        var first = (result.items || []).filter(function (item:any) { return item.name.startsWith(term); })[0];
                        return first ? first.name : '';
                    });
                }
                else {
                    return new Promise(function (resolve) { return resolve(''); });
                }
            }
            function handelSucces(val:any) {
                resultEl.style.color = val ? '' : 'grey';
                resultEl.innerText = val || '<No results>';
            }
            function handleError(err:any) {
                resultEl.style.color = 'red';
                resultEl.innerText = err && err.message || 'Error';
            }
            return Observable
                .fromEvent(inputEl, 'keyup')
                .map(function (e) { return e.currentTarget.value; })
                .distinctUntilChanged()
                .debounceTime(500)
                .switchMap(function (value) { return Observable
                .fromPromise(getGitHubStars(value))
                .catch(function (err) {
                handleError(err);
                return Observable.empty();
            }); })
                .subscribe(handelSucces);
        },
        infoHtml: "Type a name and it will autocomplete to the first GitHub repo starting with this value:<br/><br/>\n        <input id='autocomplete' autofocus placeholder=\"Repo name?\"></input><div id='autocomplete-result'>&nbsp;</div>\n        <pre>Observable\n  .fromEvent<Event>(autoCompleteEl, 'keyup')\n  .map(e => e.currentTarget.value)\n  .distinctUntilChanged()\n  .debounceTime(500)\n  .switchMap(value => Observable\n    .fromPromise(searchGitHub(value))\n    .catch(err => {\n       handleError(err);\n       return Observable.empty();\n    })\n  )\n  .subscribe(handelSucces);</pre>"
    },
    'dragDrop': {
        name: "Drag & Drop",
        group: 'Samples',
        onlyStop: true,
        autoPlay: true,
        exec: function () {
            var blockDragEl = document.getElementById('block-drag');
            var mouseDown$ = Observable.fromEvent(blockDragEl, 'mousedown').map(function (e) { return e.pageX; });
            var mouseMove$ = Observable.fromEvent(window, 'mousemove').map(function (e) { return e.pageX; });
            var mouseUp$ = Observable.fromEvent(window, 'mouseup');
            var touchStart$ = Observable.fromEvent(blockDragEl, 'touchstart').map(function (e) { return Math.round(e.touches[0].pageX); });
            var touchMove$ = Observable.fromEvent(window, 'touchmove').map(function (e) { return Math.round(e.touches[0].pageX); });
            var touchEnd$ = Observable.fromEvent(window, 'touchend');
            var start$ = mouseDown$.merge(touchStart$);
            var move$ = mouseMove$.merge(touchMove$);
            var end$ = mouseUp$.merge(touchEnd$);
            function isValid(x:number) {
                return Math.abs(x - 400 + 64) < 4;
            }
            function moveBlock(x:number) {
                // On destination ?
                if (isValid(x)) {
                    blockDragEl.style.backgroundColor = "green";
                }
                else {
                    blockDragEl.style.backgroundColor = "#44b";
                }
                blockDragEl.style.left = x + "px";
            }
            return start$
                .exhaustMap(function (xStart) { return move$
                .map(function (xMove) { return xMove - xStart; })
                .takeUntil(end$)
                .concat(Observable.single(0)); } // reset at end
            )
                .subscribe(function (x) { return moveBlock(x); });
        },
        infoHtml: "Drag the blue box to the right (when released it will be reset to the start).\n<div style=\"position:relative;width:400px;height:64px;margin:10px 0;font-family:monospace;font-size:52px;text-align:center;color:#444;user-select: none\">\n<div id='block-start' style='position:absolute;left:0;display:inline-block;width:64px;height:64px; background-color:#222;border:1px solid #666'></div>\n<div id='block-end' style='position:absolute;right:0;display:inline-block;width:64px;height:64px; background-color:#222;border:1px solid #666'></div>\n<div id='block-drag' style='position:absolute;left:0;display:inline-block;width:56px;height:56px;background-color:#44b;border:1px solid #66d;margin:4px;cursor:hand'></div>\n&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;\n</div><pre>\nconst mouseDown$ = Observable.fromEvent(blockDragEl, 'mousedown').map(e => e.pageX);\nconst mouseMove$ = Observable.fromEvent(window, 'mousemove').map(e => e.pageX);\nconst mouseUp$ = Observable.fromEvent(window, 'mouseup');\n\nconst touchStart$ = Observable.fromEvent(blockDragEl, 'touchstart').map(e => e.touches[0].pageX);\nconst touchMove$ = Observable.fromEvent(window, 'touchmove').map(e => e.touches[0].pageX);\nconst touchEnd$ = Observable.fromEvent(window, 'touchend');\n\nconst start$ = mouseDown$.merge(touchStart$);\nconst move$ = mouseMove$.merge(touchMove$);\nconst end$ = mouseUp$.merge(touchEnd$);\n\nObservable\n  .exhaustMap(xStart => move$\n     .map(xMove => xMove - xStart)\n     .takeUntil(end$)\n     .concat(Observable.single(0)) // On end reset to 0\n   )\n  .subscribe(moveBlock);</pre>"
    },
};
//# sourceMappingURL=examples.js.map