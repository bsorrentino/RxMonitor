"use strict";
var rxmarbles;
(function (rxmarbles) {
    // Time of one step
    class ExampleState {
        constructor(marbles, _example, done) {
            this.marbles = marbles;
            this._example = _example;
            this.done = done;
            this.isPaused = false;
            if (!_example)
                throw new Error("example in null!");
            marbles.isPaused = this.isPaused = !_example.autoPlay;
        }
        get example() {
            return this._example;
        }
        get isStopped() {
            return !this.unsubscribe;
        }
        start() {
            this.marbles.isPaused = this.isPaused = false;
            this.unsubscribe = this._example.exec(this.done);
            return this;
        }
        /**
         *
         * @param unsubscribe
         */
        stop() {
            if (!this.isStopped) {
                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = undefined;
                }
                this.marbles.isPaused = this.isPaused = true;
                console.log("stop", this._example.name);
            }
            return this;
        }
        pause() {
            this.marbles.isPaused = this.isPaused = true;
            return this;
        }
        resume() {
            if (this.isStopped)
                return this.start();
            this.marbles.isPaused = this.isPaused = false;
            return this;
        }
    }
    rxmarbles.ExampleState = ExampleState;
    class RxMarbles {
        /**
         *
         * @param div
         * @param stepInMs
         */
        constructor(div, stepInMs) {
            this.stepInMs = stepInMs;
            this.isPaused = false;
            // Sampler ticker
            let ticker = rxmarbles.Observable.interval(stepInMs).filter(() => !this.isPaused);
            // Sample items
            this._logger = new rxmarbles.SamplerLogger(ticker);
            // Draw marble diagram
            this._diagram = showMarbles(div, this._logger.getSamples());
            rxmarbles.Observable.logger = this._logger;
        }
        get logger() {
            return this._logger;
        }
        get diagram() {
            return this._diagram;
        }
        /**
         *
         * @param example
         */
        startExample(example) {
            if (!example)
                throw new Error("example argument in null!");
            this._diagram.clear();
            // Add to history
            window.history.pushState(example.code, example.name, "#" + example.code);
            const state = new ExampleState(this, example, () => {
                // Complete stops before sample is completed
                setTimeout(() => {
                    let startEl = document.getElementById('example__start');
                    ;
                    startEl.checked = false;
                    state.stop();
                }, this.stepInMs + 50);
            });
            return (example.autoPlay) ? state.start() : state;
        }
    }
    rxmarbles.RxMarbles = RxMarbles;
    /**
     *
     * @param element
     * @param stepInMs
     */
    function create(element = "marble", stepInMs = 200) {
        return new RxMarbles(document.getElementById(element), stepInMs);
    }
    rxmarbles.create = create;
})(rxmarbles || (rxmarbles = {}));
