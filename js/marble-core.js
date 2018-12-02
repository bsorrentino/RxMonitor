"use strict";
var rxmarbles;
(function (rxmarbles) {
    // Time of one step
    class ExampleState {
        constructor(marbles, _example, unsubscribe) {
            this.marbles = marbles;
            this._example = _example;
            this.unsubscribe = unsubscribe;
            this.isPaused = false;
            if (!_example)
                throw new Error("example in null!");
        }
        get isStopped() {
            return !this.unsubscribe;
        }
        /**
         *
         * @param unsubscribe
         */
        stop() {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = undefined;
            }
            this.marbles.isPaused = this.isPaused = true;
            return this;
        }
        pause() {
            this.marbles.isPaused = this.isPaused = true;
            return this;
        }
        resume() {
            if (this.isStopped)
                throw new Error(this._example.name + " already stopped!");
            this.marbles.isPaused = this.isPaused = false;
            return this;
        }
        toggle() {
            if (this._example.onlyStop) {
                console.log(this.isPaused ? "resume" : "pause");
                return this.isPaused ? this.resume() : this.pause();
            }
            else {
                console.log(this.isPaused ? "start" : "stop");
                return this.isPaused ? this.marbles.startExample(this._example) : this.stop();
            }
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
            let ticker = Observable.interval(stepInMs).filter(() => !this.isPaused);
            // Sample items
            this._logger = new SamplerLogger(ticker);
            // Draw marble diagram
            this._diagram = showMarbles(div, this._logger.getSamples());
            Observable.logger = this._logger;
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
            let state = new ExampleState(this, example, example.exec(() => {
                // Complete stops before sample is completed
                setTimeout(() => {
                    state.stop();
                    let startEl = document.getElementById('example__start');
                    ;
                    startEl.checked = false;
                }, this.stepInMs + 50);
            }));
            return state;
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
