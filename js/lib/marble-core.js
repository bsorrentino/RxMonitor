"use strict";
var rxmarbles;
(function (rxmarbles) {
    class Observable {
        constructor(producer) {
            this.producer = producer;
        }
        static interval(intervalInMs) {
            return new this((observer) => {
                var counter = 0;
                var cancellationToken = setInterval(() => {
                    observer.next(counter++);
                }, intervalInMs || 0);
                return () => clearTimeout(cancellationToken);
            });
        }
        startProducer(observer) {
            var isStopped = false;
            let next = observer.next, error = observer.error, complete = observer.complete;
            // used functions for better error stack
            observer.next = (val) => next.call(observer, val);
            observer.error = (err) => {
                error.call(observer, err);
                if (!isStopped)
                    isStopped = true;
            };
            observer.complete = () => {
                complete.call(observer);
                if (!isStopped)
                    isStopped = true;
            };
            var unsubscribe = this.producer(observer);
            return () => {
                unsubscribe();
                if (!isStopped)
                    isStopped = true;
            };
        }
        ;
        createObserver(getUnsubscribe, _observer) {
            let nextHandler = (_observer ? _observer.next : undefined) || (() => undefined);
            let errorHandler = (_observer ? _observer.error : undefined) || (() => undefined);
            let completeHandler = (_observer ? _observer.complete : undefined) || (() => undefined);
            let unsubscribeOnce = () => {
                if (!isEnded) {
                    isEnded = true;
                    // When producers calls complete/error (or next in error) synchronious, unsubscribe is undefined
                    var unsubscribe = getUnsubscribe();
                    if (typeof unsubscribe === "function")
                        unsubscribe();
                }
            };
            var isEnded = false;
            let observer = {
                next: (value) => {
                    if (!isEnded) {
                        try {
                            nextHandler(value);
                        }
                        catch (err) {
                            errorHandler(err);
                            unsubscribeOnce();
                            throw err;
                        }
                    }
                },
                error: (err) => {
                    if (!isEnded) {
                        errorHandler(err); // No need to catch
                        unsubscribeOnce();
                    }
                },
                complete: () => {
                    if (!isEnded) {
                        completeHandler(); // No need to catch, complete shouldn't call error
                        unsubscribeOnce();
                    }
                }
            };
            return {
                observer: observer,
                unsubscribe: unsubscribeOnce
            };
        }
        ;
        subscribe(_observer) {
            var unsubscribe;
            let _a = this.createObserver(() => unsubscribe, _observer);
            let observer = _a.observer;
            let unsubscribeOnce = _a.unsubscribe;
            // Start producer at each subscription
            unsubscribe = this.startProducer(observer);
            return unsubscribeOnce;
        }
        filter(predicate) {
            return new Observable((_a) => {
                let next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
                return this.subscribe({
                    next: (val) => {
                        if (next && predicate(val))
                            next(val);
                    },
                    error: error,
                    complete: complete
                });
            });
        }
        ;
    }
    rxmarbles.Observable = Observable;
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
