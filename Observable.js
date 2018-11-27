var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Observable object
 */
var Observable = (function (_super) {
    __extends(Observable, _super);
    function Observable(producer, name, isCreatedByValue) {
        if (name === void 0) { name = ''; }
        if (isCreatedByValue === void 0) { isCreatedByValue = false; }
        var _this = this;
        if (typeof producer !== "function")
            throw new Error('An Observable needs a producer function as argument.');
        _this = _super.call(this, name, isCreatedByValue) || this;
        _this.producer = producer;
        return _this;
    }
    Observable.empty = function (name) {
        if (name === void 0) { name = 'empty'; }
        return new this(function (_a) {
            var complete = _a.complete;
            complete();
            return function () { return undefined; }; // Unsubscribe
        }, name);
    };
    /** Never completes and doesn't emit values */
    Observable.never = function () {
        return new this(function () {
            return function () { return undefined; }; // Unsubscribe
        }, 'never');
    };
    /** Emit a single value */
    Observable.single = function (val) {
        return new this(function (_a) {
            var next = _a.next, complete = _a.complete;
            next(val);
            complete();
            return function () { return undefined; }; // Unsubscribe
        }, 'single');
    };
    /** Emit all values passed */
    Observable.of = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new this(function (_a) {
            var next = _a.next, complete = _a.complete;
            args.forEach(function (arg) {
                next(arg);
            });
            complete();
            return function () { return undefined; }; // Unsubscribe
        }, 'of');
    };
    /** Counter on specified interval */
    Observable.throw = function (err) {
        return new this(function (_a) {
            var error = _a.error, complete = _a.complete;
            error(err);
            complete();
            return function () { return undefined; }; // Unsubscribe
        }, 'throw');
    };
    Observable.fromPromise = function (promise) {
        return new this(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete;
            promise.then(function (val) {
                next(val);
                complete();
            }, error);
            return function () { return undefined; }; // Unsubscribe
        }, 'fromPromise');
    };
    /** Counter on specified interval */
    Observable.interval = function (intervalInMs) {
        var name = "interval(" + intervalInMs + ")";
        if (typeof intervalInMs !== "number")
            throw new Error('interval delay required.');
        return new this(function (observer) {
            var counter = 0;
            var cancellationToken = setInterval(function () {
                observer.next(counter++);
            }, intervalInMs || 0);
            return function () {
                clearTimeout(cancellationToken);
            };
        }, name);
    };
    /** Counter on specified interval */
    Observable.fromEvent = function (target, eventName) {
        if (!target)
            throw new Error('fromEvent requires a target.');
        if (!eventName)
            throw new Error('fromEvent requires an eventName.');
        var targetName = '?';
        if (target && target.id)
            targetName = target.id;
        if (target === window)
            targetName = 'window';
        if (target === document)
            targetName = 'document';
        var name = "fromEvent('" + targetName + "', '" + eventName + "')";
        return new this(function (observer) {
            function handler(e) { observer.next(e); }
            ;
            target.addEventListener(eventName, handler);
            return function () {
                target.removeEventListener(eventName, handler);
            };
        }, name);
    };
    //========================================
    // MEMBERS
    //----------------------------------------
    /** Created so sub class can decide how new Observables should be created */
    Observable.prototype.create = function (producer, name) {
        return new Observable(producer, name);
    };
    /*
     * Create for 3 individual functions a observer object
     * This will unsubscribe once, error once and complete once
     */
    Observable.prototype.createObserver = function (getUnsubscribe, observerOrNext, error, complete) {
        var nextHandler = (typeof observerOrNext === "object" ? observerOrNext.next : observerOrNext) || (function () { return undefined; });
        var errorHandler = (typeof observerOrNext === "object" ? observerOrNext.error : error) || (function () { return undefined; });
        var completeHandler = (typeof observerOrNext === "object" ? observerOrNext.complete : complete) || (function () { return undefined; });
        var unsubscribeOnce = function () {
            if (!isEnded) {
                isEnded = true;
                // When producers calls complete/error (or next in error) synchronious, unsubscribe is undefined
                var unsubscribe_1 = getUnsubscribe();
                if (typeof unsubscribe_1 === "function")
                    unsubscribe_1();
            }
        };
        var isEnded = false;
        var observer = {
            next: function (value) {
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
            error: function (err) {
                if (!isEnded) {
                    errorHandler(err); // No need to catch
                    unsubscribeOnce();
                }
            },
            complete: function () {
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
    };
    /** Created startProducer so easily overridable */
    Observable.prototype.startProducer = function (observer, parentProducerId) {
        if (parentProducerId === void 0) { parentProducerId = ""; }
        var producerId = Observable.getProducerId();
        var logger = this.logger;
        var name = this.name;
        var isStopped = false;
        // Logger can still be null when in subject started producing subject before debugSubject is initialized
        // reverse deps?
        if (logger)
            logger.onStart(producerId, this.name, parentProducerId, this.isCreatedByValue, false);
        var next = observer.next, error = observer.error, complete = observer.complete;
        // used functions for better error stack
        observer.next = function valueWithLogging(val) {
            if (logger)
                logger.onValue(val, producerId, name, parentProducerId);
            next.call(observer, val);
        };
        observer.error = function errorWithLogging(err) {
            if (logger)
                logger.onError(err, producerId, name, parentProducerId);
            if (logger && !isStopped) {
                //logger.onStop(producerId, name, parentProducerId);
                isStopped = true;
            }
            error.call(observer, err);
        };
        observer.complete = function completeWithLogging() {
            if (logger)
                logger.onComplete(producerId, name, parentProducerId);
            if (logger && !isStopped) {
                //logger.onStop(producerId, name, parentProducerId);
                isStopped = true;
            }
            complete.call(observer);
        };
        // Add hidden producerId on the observer, so it knows the producer id it is listening to
        observer.producerId = producerId;
        var unsubscribe = this.producer(observer);
        return function unsubscribeWithLogging() {
            unsubscribe();
            if (logger && !isStopped) {
                logger.onStop(producerId, name, parentProducerId);
                isStopped = true;
            }
        };
    };
    Observable.prototype.subscribe = function (observerOrNext, errorOrProducerId, complete, producerId) {
        // Get ProducerId
        var error = errorOrProducerId;
        if (typeof errorOrProducerId === 'string') {
            producerId = errorOrProducerId;
            error = undefined;
        }
        else {
            error = errorOrProducerId;
        }
        var unsubscribe;
        var _a = this.createObserver(function () { return unsubscribe; }, observerOrNext, error, complete), observer = _a.observer, unsubscribeOnce = _a.unsubscribe;
        // Start producer at each subscription
        unsubscribe = this.startProducer(observer, producerId);
        return unsubscribeOnce;
    };
    /**
     * complete after X values
     * take(3)
     * in:  ─────□───────△─────────○──────▷───
     * out: ─────□───────△─────────○┤
     */
    Observable.prototype.take = function (numberOfValues) {
        var _this = this;
        if (numberOfValues === void 0) { numberOfValues = 1; }
        var name = "take(" + numberOfValues + ")";
        if (numberOfValues === 0)
            return Observable.empty(name);
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var count = 0;
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    next(val);
                    count++;
                    if (count >= numberOfValues)
                        complete();
                },
                error: error,
                complete: complete,
            }, producerId);
            return unsubscribe;
        }, name);
    };
    /**
     * Take values while predicate returns true
     * takeWhile(i => i !== '○')
     * in:  ─────□───────△─────────○──────▷───
     * out: ─────□───────△─────────┤
     */
    Observable.prototype.takeWhile = function (predicate) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var isStopped = false;
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    if (isStopped)
                        return;
                    if (predicate(val)) {
                        next(val);
                    }
                    else {
                        isStopped = true;
                        complete();
                    }
                },
                error: error,
                complete: complete
            }, producerId);
            return unsubscribe;
        }, 'takeWhile');
    };
    /**
     * Emits the values emitted by the source Observable until a notifier Observable emits a value.
     * takeUntil(observable)
     * in:  ─────□───────△─────────○──────▷───
     * obs: ────────────────────△─────────○────
     * out: ─────□───────△──────┤
     */
    Observable.prototype.takeUntil = function (observable) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribeMain = _this.subscribe({
                next: next,
                error: error,
                complete: complete
            }, producerId);
            var unsubscribeUntil = observable.subscribe({
                next: complete,
                error: complete,
                complete: complete
            }, producerId);
            return function () {
                if (unsubscribeMain)
                    unsubscribeMain();
                if (unsubscribeUntil)
                    unsubscribeUntil();
            };
        }, 'takeUntil');
    };
    /**
     * Get the lowest value
     * min()
     * in:  ─────3───────1─────────2
     * out: ───────────────────────1
     */
    Observable.prototype.min = function (comparer) {
        var _this = this;
        if (!comparer)
            throw new Error('min requires a comparer function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values = [];
            var unsubscribe = _this.subscribe({
                next: function (val) { return values.push(val); },
                error: error,
                complete: function () {
                    if (values.length > 0) {
                        values.sort(comparer);
                        next(values[0]);
                    }
                    complete();
                },
            }, producerId);
            return unsubscribe;
        }, 'min');
    };
    /**
     * Filter out unwanted values
     * filter(i => i === △ || i === ▷)
     * in:  ─────□───────△─────────○──────▷───
     * out: ─────────────△────────────────▷───
     */
    Observable.prototype.filter = function (predicate) {
        var _this = this;
        if (!predicate)
            throw new Error('filter requires a predicate function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return _this.subscribe({
                next: function (val) {
                    if (next && predicate(val))
                        next(val);
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'filter');
    };
    /**
    * Suppress the first n items emitted by an Observable
    * skip(2)
    * in:  ─────□───────△─────────○──────▷───
    * out: ───────────────────────○──────▷───
    */
    Observable.prototype.skip = function (nbrToSkip) {
        var _this = this;
        var name = "skip(" + nbrToSkip + ")";
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var nextCounter = 0;
            return _this.subscribe({
                next: function (val) {
                    if (next) {
                        if (nextCounter < nbrToSkip) {
                            nextCounter++;
                        }
                        else {
                            next(val);
                        }
                    }
                },
                error: error,
                complete: complete
            }, producerId);
        }, name);
    };
    /**
    * emit only the last item emitted by an Observable
    * last()
    * in:  ─────□───────△─────────○──────▷
    * out: ──────────────────────────────▷
    */
    Observable.prototype.last = function () {
        var _this = this;
        // TODO: allow a predicate
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue;
            return _this.subscribe({
                next: function (val) {
                    hasValue = true;
                    lastValue = val;
                },
                error: error,
                complete: function () {
                    if (hasValue)
                        next(lastValue);
                    complete();
                }
            }, producerId);
        }, 'last');
    };
    /**
     * Remove duplicate values
     * reduce((acc, val) => acc + val)
     * in:  ─────1───────3─────────2──────5 ───
     * out: ──────────────────────────────11───
     */
    Observable.prototype.reduce = function (accumulator, seed) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values = [];
            return _this.subscribe({
                next: function (val) { return values.push(val); },
                error: error,
                complete: function () {
                    if (values.length > 0) {
                        next(values.reduce(function (prev, val, index) { return accumulator(prev, val, index); }, seed));
                    }
                    complete();
                }
            }, producerId);
        }, 'reduce');
    };
    /**
     * Remove duplicate values
     * distinct()
     * in:  ─────□──────○────○──────□───
     * out: ─────□──────○───────────────
     */
    Observable.prototype.distinct = function () {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values = [];
            return _this.subscribe({
                next: function (val) {
                    if (next) {
                        if (!values.includes(val)) {
                            next(val);
                            values.push(val);
                        }
                    }
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'distinct');
    };
    /**
     * Suppress same values in a row
     * distinctUntilChanged(2)
     * in:  ─────□──────○────○──────□───
     * out: ─────□──────○───────────□───
     */
    Observable.prototype.distinctUntilChanged = function () {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue;
            return _this.subscribe({
                next: function (val) {
                    if (next) {
                        if (hasValue) {
                            if (lastValue !== val) {
                                next(val);
                                lastValue = val;
                            }
                        }
                        else {
                            hasValue = true;
                            lastValue = val;
                            next(val);
                        }
                    }
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'distinctUntilChanged');
    };
    /**
     * Catches errors on the observable to be handled by returning a new observable or throwing an error.
     * catch(() => Observable.single('☆'))
     * in:  ─────□───────△─────────✖
     * out: ─────□───────△─────────☆
     */
    Observable.prototype.catch = function (fn) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return _this.subscribe({
                next: next,
                error: function (err) {
                    var errorObservable = fn(err, _this);
                    return errorObservable.subscribe({
                        next: next,
                        error: error,
                        complete: complete
                    }, producerId);
                },
                complete: complete
            }, producerId);
        }, 'catch');
    };
    /**
     * Change the values
     * map(i => fill(i))
     * in:  ─────□───────△─────────○──────▷───
     * out: ─────■───────▲─────────●──────▶───
     */
    Observable.prototype.map = function (projection) {
        var _this = this;
        if (!projection)
            throw new Error('map requires a projection function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return _this.subscribe({
                next: function (val) {
                    if (next)
                        next(projection(val));
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'map');
    };
    /**
     * Update values based on previous value
     * scan((acc, val) => acc + val)
     * in:  ─────1───────3─────────2──────5 ───
     * out: ─────1───────4─────────6──────11───
     */
    Observable.prototype.scan = function (accumulator, seed) {
        var _this = this;
        if (!accumulator)
            throw new Error('scan requires a accumulator function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var index = 0;
            var acc;
            return _this.subscribe({
                next: function (val) {
                    acc = accumulator(index === 0 ? seed : acc, val, index);
                    index += 1;
                    if (next)
                        next(acc);
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'scan');
    };
    /**
     * Delay each value
     * delay(1000)
     * in:  ─────□───────△─────────○──────▷───
     *           ╰─────────□       ╰─────────○
     *                   ╰─────────△      ╰─────────▷
     * out: ───────────────□───────△─────────○──────▷─
     */
    Observable.prototype.delay = function (delayInMs) {
        var _this = this;
        var name = "delay(" + delayInMs + ")";
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            // Start delayed execution
            var runningTimers = [];
            function delayedExec(then) {
                var cancellationToken = setTimeout(function () {
                    runningTimers = runningTimers.filter(function (token) { return token !== cancellationToken; });
                    then();
                }, delayInMs);
                runningTimers = runningTimers.concat([cancellationToken]);
            }
            ;
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.value(val);
                        childLogger.complete();
                        childLogger.end();
                        next(val);
                    });
                },
                error: function (err) {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.error(err);
                        childLogger.end();
                        error(err);
                    });
                },
                complete: function () {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.complete();
                        childLogger.end();
                        complete();
                    });
                }
            }, producerId);
            // Stop timers on unsubscribe
            return function () {
                runningTimers.forEach(clearTimeout);
                unsubscribe();
            };
        }, name);
    };
    /**
     * Emits a value from the source Observable only after a particular time span has passed without another source emission.
     * debounceTime(1000)
     * in:  ─────□──────△─────────○──────▷───
     *           ╰───────□        ╰───────○
     *                   ╰───────△       ╰───────▷
     * out: ─────────────────────△───────────────▷─
     */
    Observable.prototype.debounceTime = function (delayInMs) {
        var _this = this;
        var name = "debounceTime(" + delayInMs + ")";
        ;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var running;
            // Start delayed execution
            function delayedExec(then, childLogger) {
                // Cancel Previous
                if (running)
                    running.dispose();
                // Start Delayed function
                var cancellationToken = setTimeout(function () {
                    running = undefined;
                    then();
                    childLogger.end();
                }, delayInMs);
                running = {
                    dispose: function () {
                        clearTimeout(cancellationToken);
                        childLogger.end();
                    }
                };
            }
            ;
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.value(val);
                        childLogger.complete();
                        next(val);
                    }, childLogger);
                },
                error: function (err) {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.error(err);
                        error(err);
                    }, childLogger);
                },
                complete: function () {
                    var childLogger = _this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(function () {
                        childLogger.complete();
                        complete();
                    }, childLogger);
                }
            }, producerId);
            // Stop timers on unsubscribe
            return function () {
                if (running)
                    running.dispose();
                unsubscribe();
            };
        }, name);
    };
    /**
     * Emits a value from the source Observable, then ignores subsequent source values for duration milliseconds, then repeats this process.
     * throttleTime(1000)
     * in:  ─────□──────△─────────○──────▷───────
     *           ╰───────         ╰───────
     *                  ╰───────┤        ╰───────┤
     * out: ─────□────────────────○───────────────
     */
    Observable.prototype.throttleTime = function (duration) {
        var _this = this;
        var name = "throttleTime(" + duration + ")";
        ;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var running;
            // Start delayed execution
            function delayedExec(then, childLogger) {
                // Cancel Previous
                if (running)
                    running.dispose();
                // Start Delayed function
                var cancellationToken = setTimeout(function () {
                    running = undefined;
                    then();
                    childLogger.end();
                }, duration);
                running = {
                    dispose: function () {
                        clearTimeout(cancellationToken);
                        childLogger.end();
                    }
                };
            }
            ;
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    // Only emit if time passed
                    if (!running) {
                        var childLogger_1 = _this.createChildLogger(producerId);
                        childLogger_1.start();
                        delayedExec(function () {
                            childLogger_1.complete();
                        }, childLogger_1);
                        next(val);
                    }
                },
                error: function (err) {
                    if (running)
                        running.dispose();
                    error(err);
                },
                complete: function () {
                    if (running)
                        running.dispose();
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return function () {
                if (running)
                    running.dispose();
                unsubscribe();
            };
        }, name);
    };
    /**
     * Buffers the source Observable values for a specific time period.
     * bufferTime(1000)
     * in:  ─────□────△───○──────▷─────────
     *      ────────□       ────────▷
     *              ────────[△,○]   ────────┤
     * out: ────────□───────[△,○]───▷──────
     */
    Observable.prototype.bufferTime = function (bufferTimeSpan) {
        var _this = this;
        var name = "bufferTime(" + bufferTimeSpan + ")";
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values = [];
            var childLogger = _this.createChildLogger(producerId, false);
            childLogger.start();
            // TODO: how to handle pause without schedulers
            var cancellationToken = setInterval(function () {
                childLogger.value(values);
                childLogger.complete();
                childLogger.end();
                // Emit buffered items
                if (values.length > 0)
                    next(values);
                // Reset
                values = [];
                // Restart
                childLogger = _this.createChildLogger(producerId, false);
                childLogger.start();
            }, bufferTimeSpan);
            var unsubscribe = _this.subscribe({
                next: function (val) { return values.push(val); },
                error: function (err) {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    error(err);
                },
                complete: function () {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return function () {
                if (cancellationToken)
                    clearInterval(cancellationToken);
                unsubscribe();
            };
        }, name);
    };
    /**
     * Emits the most recently emitted value from the source Observable within periodic time intervals.
     * sampleTime(1000)
     * in:  ─────□────△───○──────▷────────
     *      ────────□       ────────▷
     *              ────────○       ───────
     * out: ────────□───────○───────▷─────
     */
    Observable.prototype.sampleTime = function (period) {
        var _this = this;
        var name = "sampleTime(" + period + ")";
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue;
            var childLogger = _this.createChildLogger(producerId, false);
            childLogger.start();
            // TODO: how to handle pause without schedulers
            var cancellationToken = setInterval(function () {
                if (hasValue)
                    childLogger.value(lastValue);
                childLogger.complete();
                childLogger.end();
                // Emit buffered items
                if (hasValue)
                    next(lastValue);
                // Reset
                hasValue = false;
                // Restart
                childLogger = _this.createChildLogger(producerId, false);
                childLogger.start();
            }, period);
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    hasValue = true;
                    lastValue = val;
                },
                error: function (err) {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    error(err);
                },
                complete: function () {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return function () {
                if (cancellationToken)
                    clearInterval(cancellationToken);
                unsubscribe();
            };
        }, name);
    };
    /**
     * Start an Observable with the specified value(s)
     * in1: ───▷────□───────────○──────△───┤
     * val: □
     * out: □──▷────□───────────○──────△───┤
     */
    Observable.prototype.startWith = function () {
        var _this = this;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            if (values)
                values.forEach(next);
            // Subscribe to stream1
            return _this.subscribe({
                next: next,
                error: error,
                complete: complete
            }, producerId);
        }, "startWith");
    };
    /**
     * Merge 2 streams into one
     * in1: ───▷────□───────────○──────△───┤
     * in2: ─────□───────△─────────○──────▷┤
     * out: ───▷────□───────────○──────△────────□───────△─────────○──────▷┤
     */
    Observable.prototype.concat = function (stream) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribe;
            // Subscribe to stream1
            unsubscribe = _this.subscribe({
                next: next,
                error: error,
                complete: function () {
                    // Start second observable// Subscribe to stream1
                    unsubscribe = stream.subscribe({
                        next: next,
                        error: error,
                        complete: complete
                    }, producerId);
                }
            }, producerId);
            return function () {
                if (unsubscribe)
                    unsubscribe();
            };
        }, "concat");
    };
    /**
     * Merge 2 streams into one
     * in1: ───▷────□───────────○──────△───
     * in2: ─────□───────△─────────○──────▷───
     * out: ───▷─□──□────△──────○──○───△──▷───
     * When both stream end (first error or completed returned)
     */
    Observable.prototype.merge = function (stream) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var error1;
            var isCompleted1 = false;
            var error2;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = _this.subscribe({
                next: next,
                error: function (err) {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        error(err);
                    error1 = err;
                },
                complete: function () {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        complete(); // Both complete?
                    isCompleted1 = true;
                }
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: next,
                error: function (err) {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        error(err);
                    error2 = err;
                },
                complete: function () {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return function () {
                unsubscribe1();
                unsubscribe2();
            };
        }, "merge");
    };
    /**
     * Merge 2 streams into one
     * shape: ───▷────□───────────●──────▲──────
     * fill:  ─────■───────▲─────────□──────▷───
     * out:   ─────▶──■────■──────●──○───△─△───
     * When both stream end (first error or completed returned)
     */
    Observable.prototype.combineLatest = function (stream, combineFn) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue1 = false;
            var lastValue1;
            var error1;
            var isCompleted1 = false;
            var hasValue2 = false;
            var lastValue2;
            var error2;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = _this.subscribe({
                next: function (val) {
                    if (hasValue2)
                        next(combineFn(val, lastValue2));
                    hasValue1 = true;
                    lastValue1 = val;
                },
                error: function (err) {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        error(err);
                    error1 = err;
                },
                complete: function () {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        complete(); // Both complete?
                    isCompleted1 = true;
                }
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: function (val) {
                    if (hasValue1)
                        next(combineFn(lastValue1, val));
                    hasValue2 = true;
                    lastValue2 = val;
                },
                error: function (err) {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        error(err);
                    error2 = err;
                },
                complete: function () {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return function () {
                unsubscribe1();
                unsubscribe2();
            };
        }, "combineLatest");
    };
    /**
     * shape: ───▷────□───────────●──────▲──────
     * fill:  ─────■───────▲─────────□──────▷───
     * out:   ────────■───────────●──────△────
     */
    Observable.prototype.withLatestFrom = function (stream, combineFn) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue2 = false;
            var lastValue2;
            // Subscribe to stream1
            var unsubscribe1 = _this.subscribe({
                next: function (val) {
                    // Only emit if we have a value from second stream
                    if (hasValue2)
                        next(combineFn(val, lastValue2));
                },
                error: error,
                complete: complete
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: function (val) {
                    hasValue2 = true;
                    lastValue2 = val;
                },
                error: function (err) {
                    error(err);
                },
                complete: function () { }
            }, producerId);
            return function () {
                unsubscribe1();
                unsubscribe2();
            };
        }, "withLatestFrom");
    };
    /**
     * Merge 2 streams into one
     * shape: ───▷────□───────────●────────▲───
     * fill:  ─────■───────▲─────────□────▷────
     * out:   ─────▶───────■─────────○─────△───
     * When both stream end (first error or completed returned)
     */
    Observable.prototype.zip = function (stream, combineFn) {
        var _this = this;
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var lastValues1 = [];
            var error1;
            var isCompleted1 = false;
            var lastValues2 = [];
            var error2;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = _this.subscribe({
                next: function (val) {
                    if (lastValues2.length > 0) {
                        next(combineFn(val, lastValues2.shift()));
                    }
                    else {
                        lastValues1.push(val);
                    }
                },
                error: function (err) {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        error(err);
                    error1 = err;
                },
                complete: function () {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        complete(); // Both complete?
                    isCompleted1 = true;
                }
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: function (val) {
                    if (lastValues1.length > 0) {
                        next(combineFn(lastValues1.shift(), val));
                    }
                    else {
                        lastValues2.push(val);
                    }
                },
                error: function (err) {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        error(err);
                    error2 = err;
                },
                complete: function () {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return function () {
                unsubscribe1();
                unsubscribe2();
            };
        }, "zip");
    };
    /**
     * Start for each value a new Observable and merge them to output
     * mergeMap(shape => Observable.fromPromise(fetch(`http://shapes.io/fill?shape=${shape}`)))
     * in:  ─────□───────△────○──────▷──────
     *           ╰───■   ╰──────▲    ╰─────▶
     *                        ╰─────●
     * out: ─────────■──────────▲───●──────▶─
     */
    Observable.prototype.mergeMap = function (projectionStream) {
        var _this = this;
        if (!projectionStream)
            throw new Error('mergeMap requires a projectionStream function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribes = [];
            var unsubscribe = _this.subscribe({
                next: function (val) {
                    var observable = projectionStream(val);
                    if (!observable || !observable.subscribe)
                        throw new Error('switchMap projectionStream should return an observable');
                    var unsubscribe = _this.logAndSubscribeToObservable(observable, {
                        next: function (val) { return next(val); },
                        error: error,
                        complete: function () { return undefined; } // don't complete switchMap if observable completes
                    }, producerId, true);
                    unsubscribes.push(unsubscribe);
                },
                error: error,
                complete: complete
            }, producerId);
            // Unsubscribe with children
            return function () {
                unsubscribes.forEach(function (fn) { return fn(); });
                unsubscribe();
            };
        }, 'mergeMap');
    };
    /**
     * Start for each value a new Observable when previous is finished
     * concatMap(shape => Observable.fromPromise(fetch(`http://shapes.io/fill?shape=${shape}`)))
     * in:  ─────□───────△────○──────▷──────
     *           ╰───■   ╰──────▲    ╰-─────▶
     *                        ╰--─────●
     * out: ─────────■──────────▲─────●─────▶─
     */
    Observable.prototype.concatMap = function (projectionStream) {
        var _this = this;
        if (!projectionStream)
            throw new Error('concatMap requires a projectionStream function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var queuedValues = [];
            var valueUnsubscribe = undefined;
            var runObservable = function (value, first) {
                if (first === void 0) { first = false; }
                // Is busy
                if (valueUnsubscribe) {
                    queuedValues.push(value);
                }
                else {
                    var observable = projectionStream(value);
                    if (!observable || !observable.subscribe)
                        throw new Error('concatMap projectionStream should return an observable');
                    valueUnsubscribe = _this.logAndSubscribeToObservable(observable, {
                        next: function (val) { return next(val); },
                        error: error,
                        complete: function () {
                            if (valueUnsubscribe)
                                valueUnsubscribe();
                            valueUnsubscribe = undefined;
                            if (queuedValues.length > 0) {
                                runObservable(queuedValues.shift(), false);
                            }
                        } // don't complete switchMap if observable completes
                    }, producerId, first);
                }
            };
            var mainUnsubscribe = _this.subscribe({
                next: function (val) {
                    runObservable(val, true);
                },
                error: error,
                complete: complete
            }, producerId);
            // Unsubscribe with children
            return function () {
                if (mainUnsubscribe)
                    mainUnsubscribe();
                if (valueUnsubscribe)
                    valueUnsubscribe();
            };
        }, 'concatMap');
    };
    /**
     * Start for each value a new Observable and unsubscribe from previous
     * switchMap(i => Observable.interval())
     * in:  ─────□───────△────○──────▷──────
     *           ╰───■   ╰─────      ╰─────▶
     *                        ╰─────●
     * out: ─────────■──────────────●──────▶─
     */
    Observable.prototype.switchMap = function (projectionStream) {
        var _this = this;
        if (!projectionStream)
            throw new Error('switchMap requires a projectionStream function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribe;
            return _this.subscribe({
                next: function (val) {
                    if (unsubscribe)
                        unsubscribe(); // Unsubscribe previous
                    var observable = projectionStream(val);
                    if (!observable || !observable.subscribe)
                        throw new Error('switchMap projectionStream should return an observable');
                    unsubscribe = _this.logAndSubscribeToObservable(observable, {
                        next: function (val) { return next(val); },
                        error: error,
                        complete: function () { return undefined; } // don't complete switchMap if observable completes
                    }, producerId, true);
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'switchMap');
    };
    /**
     * Start for an Observable for values when previous Observable is completed
     * switchMap(i => Observable.interval())
     * in:  ─────□───────△────○──────▷──────
     *           ╰───■   ╰──────▲    ╰─────▶
     * out: ─────────■──────────▲──────────▶─
     */
    Observable.prototype.exhaustMap = function (projectionStream) {
        var _this = this;
        if (!projectionStream)
            throw new Error('switchMap requires a projectionStream function');
        return this.create(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribe;
            return _this.subscribe({
                next: function (val) {
                    if (!unsubscribe) {
                        var observable = projectionStream(val);
                        if (!observable || !observable.subscribe)
                            throw new Error('switchMap projectionStream should return an observable');
                        unsubscribe = _this.logAndSubscribeToObservable(observable, {
                            next: function (val) { return next(val); },
                            error: error,
                            complete: function () {
                                unsubscribe = undefined;
                            }
                        }, producerId, true);
                    }
                },
                error: error,
                complete: complete
            }, producerId);
        }, 'exhaustMap');
    };
    return Observable;
}(ObservableBase));
//# sourceMappingURL=Observable.js.map