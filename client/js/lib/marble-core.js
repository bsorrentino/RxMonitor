"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const marble_handler_1 = require("./marble-handler");
const marble_ui_1 = require("./marble-ui");
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
exports.ExampleState = ExampleState;
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
        let ticker = rxjs_1.interval(stepInMs).pipe(operators_1.filter(() => !this.isPaused));
        // Sample items
        this._logger = new marble_handler_1.SamplerLogger(ticker);
        // Draw marble diagram
        this._diagram = marble_ui_1.showMarbles(div, this._logger.getSamples());
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
    startExample(example, done) {
        if (!example)
            throw new Error("example argument in null!");
        this._diagram.clear();
        const state = new ExampleState(this, example, () => {
            // Complete stops before sample is completed
            setTimeout(() => {
                if (done)
                    done();
                state.stop();
            }, this.stepInMs + 50);
        });
        return (example.autoPlay) ? state.start() : state;
    }
}
exports.RxMarbles = RxMarbles;
/**
 *
 * @param element
 * @param stepInMs
 */
function create(element = "marble", stepInMs = 200) {
    return new RxMarbles(document.getElementById(element), stepInMs);
}
exports.create = create;
