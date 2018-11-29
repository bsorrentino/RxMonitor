

class Observable extends ObservableBase {

    constructor( private producer:Function, name = '', isCreatedByValue = false) {
        super( name, isCreatedByValue);

        if (typeof producer !== "function")
            throw new Error('An Observable needs a producer function as argument.');

    }

    static producerId = '';

    static empty(name = "empty") {
        return new this( (_a:any) => {
            var complete = _a.complete;
            complete();
            return () => { return <any>undefined; } // Unsubscribe
        }, name);
    }

    /** Never completes and doesn't emit values */
    static never () {
        return new this(() => {
            return () => { return <any>undefined; }; // Unsubscribe
        }, 'never');
    };

    /** Emit a single value */
    static single(val:any) {
        return new this((_a:any) => {
            var next = _a.next, complete = _a.complete;
            next(val);
            complete();
            return () => { return <any>undefined; }; // Unsubscribe
        }, 'single');
    };

    /** Emit all values passed */
    static of( ...args:any ) {
        return new this( (_a:any) => {
            var next = _a.next, complete = _a.complete;
            args.forEach( (arg:any) => {
                next(arg);
            });
            complete();
            return () => { return <any>undefined; }; // Unsubscribe
        }, 'of');
    };
    /** Counter on specified interval */
    static throw(err:any)  {
        return new this( (_a:any) => {
            var error = _a.error, complete = _a.complete;
            error(err);
            complete();
            return () => { return <any>undefined; }; // Unsubscribe
        }, 'throw');
    };

    static fromPromise(promise:any) {
        return new this((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete;
            promise.then((val:any) => {
                next(val);
                complete();
            }, error);
            return () => { return <any>undefined; }; // Unsubscribe
        }, 'fromPromise');
    };

    /** Counter on specified interval */
    static interval(intervalInMs:number) {

        var name = "interval(" + intervalInMs + ")";

        if (typeof intervalInMs !== "number")
            throw new Error('interval delay required.');

        return new this( (observer:any) => {
            var counter = 0;
            var cancellationToken = setInterval(() => {
                observer.next(counter++);
            }, intervalInMs || 0);
            return () => clearTimeout(cancellationToken);
        }, name);
    };

    /** Counter on specified interval */
    static fromEvent(target:any, eventName:string) {
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
        let name = "fromEvent('" + targetName + "', '" + eventName + "')";
        return new this( (observer:any) => {
            let handler = (e:any) => observer.next(e);
            ;
            target.addEventListener(eventName, handler);
            return () => target.removeEventListener(eventName, handler);
        }, name);
    };

    /** Created so sub class can decide how new Observables should be created */
    create(producer:any, name?:string) {
        return new Observable(producer, name);
    };

    /*
     * Create for 3 individual functions a observer object
     * This will unsubscribe once, error once and complete once
     */
    createObserver(getUnsubscribe:any, observerOrNext:any, error:( (e:any) => void ), complete:( () => void )) {

        let nextHandler = (typeof observerOrNext === "object" ? observerOrNext.next : observerOrNext) || (() => <any>undefined );
        let errorHandler = (typeof observerOrNext === "object" ? observerOrNext.error : error) || (() => <any>undefined);
        let completeHandler = (typeof observerOrNext === "object" ? observerOrNext.complete : complete) || (() => <any>undefined);
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
            next: (value:any) => {
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
            error: (err:any) => {
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
    };
    /** Created startProducer so easily overridable */
   startProducer(observer:Observer, parentProducerId = "") {
        
        let producerId = Observable.getProducerId();
        let logger = ObservableBase.logger;
        let name = this.name;

        // GUARD BLOCK
        //if( !logger) throw new Error("illegal stte exception!. logger is undefined");
        
        
        var isStopped = false;
        // Logger can still be null when in subject started producing subject before debugSubject is initialized
        // reverse deps?
        if (logger)
            logger.onStart(producerId, this.name, parentProducerId, this.isCreatedByValue, false);
        var next = observer.next, error = observer.error, complete = observer.complete;
        // used functions for better error stack
        observer.next = (val:any) => {
            if (logger)
                logger.onValue(val, producerId, name, parentProducerId);
            next.call(observer, val);
        };
        observer.error = (err:any) => {
            if (logger)
                logger.onError(err, producerId, name, parentProducerId);
            if (logger && !isStopped) {
                //logger.onStop(producerId, name, parentProducerId);
                isStopped = true;
            }
            error.call(observer, err);
        };
        observer.complete = () => {
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
        return () => {
            unsubscribe();
            if (logger && !isStopped) {
                logger.onStop(producerId, name, parentProducerId);
                isStopped = true;
            }
        };
    };

    subscribe( observerOrNext:Observer, errorOrProducerId?:any, complete?:( () => void ), producerId?:string) {
        // Get ProducerId
        var error = errorOrProducerId;
        if (typeof errorOrProducerId === 'string') {
            producerId = errorOrProducerId;
            error = undefined;
        }
        else {
            error = errorOrProducerId;
        }
        var unsubscribe:(()=>void);
        let _a = this.createObserver(() => unsubscribe, 
                                    observerOrNext, 
                                    error, 
                                    complete);

        let observer = _a.observer;
        let unsubscribeOnce = _a.unsubscribe;
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
    take(numberOfValues:number) {
        if (numberOfValues === void 0) { numberOfValues = 1; }
        var name = "take(" + numberOfValues + ")";
        if (numberOfValues === 0)
            return Observable.empty(name);
        return this.create((_a:any) => {
            let next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var count = 0;
            var unsubscribe = this.subscribe({
                next: (val:any) => {
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
    takeWhile(predicate:((e:any) => boolean)) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var isStopped = false;
            var unsubscribe = this.subscribe({
                next: (val) => {
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
    takeUntil(observable:Observable) {
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribeMain = this.subscribe({
                next: next,
                error: error,
                complete: complete
            }, producerId);
            var unsubscribeUntil = observable.subscribe({
                next: complete,
                error: complete,
                complete: complete
            }, producerId);
            return () => {
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
    min(comparer:((a: any, b: any) => number)) {
        if (!comparer)
            throw new Error('min requires a comparer function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values:Array<any> = [];
            var unsubscribe = this.subscribe({
                next: (val) => { return values.push(val); },
                error: error,
                complete: () => {
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
    filter(predicate:((e:any) => boolean)) {
        if (!predicate)
            throw new Error('filter requires a predicate function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return this.subscribe({
                next: (val) => {
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
    skip(nbrToSkip:number) {
        
        var name = "skip(" + nbrToSkip + ")";
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var nextCounter = 0;
            return this.subscribe({
                next: (val) => {
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
    last () {
        // TODO: allow a predicate
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue:any;
            return this.subscribe({
                next: (val) => {
                    hasValue = true;
                    lastValue = val;
                },
                error: error,
                complete: () => {
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
    reduce (accumulator:(( prev:any, val:any, index:number) => any), seed:any) {
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values:Array<any> = [];
            return this.subscribe({
                next: (val) => { return values.push(val); },
                error: error,
                complete: () => {
                    if (values.length > 0) {
                        next(values.reduce( (prev, val, index) => accumulator(prev, val, index), seed));
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
    distinct () {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values:Array<any> = [];
            return this.subscribe({
                next: (val) => {
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
    distinctUntilChanged () {
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue:any;
            return this.subscribe({
                next: (val) => {
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
    catch (fn:(( err:any, o:Observable) => Observable)) {
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return this.subscribe({
                next: next,
                error: (err) => {
                    var errorObservable = fn(err, this);
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
    map (projection:( (e:any) => any)) {
        if (!projection)
            throw new Error('map requires a projection function');
        return this.create((_a:any) => {
            let next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return this.subscribe({
                next: (val) => {
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
    scan (accumulator:( ( acc:any, val:any, index:number) => any ), seed:any) {
        if (!accumulator)
            throw new Error('scan requires a accumulator function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var index = 0;
            var acc:any;
            return this.subscribe({
                next: (val) => {
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
    delay (delayInMs:number) {
        var name = "delay(" + delayInMs + ")";
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            // Start delayed execution
            var runningTimers:Array<any> = [];

            function delayedExec(then:(()=>any)) {
                var cancellationToken = setTimeout( () => {
                    runningTimers = runningTimers.filter( (token) => { return token !== cancellationToken; });
                    then();
                }, delayInMs);
                runningTimers = runningTimers.concat([cancellationToken]);
            }
            ;
            var unsubscribe = this.subscribe({
                next: (val) => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec( () => {
                        childLogger.value(val);
                        childLogger.complete();
                        childLogger.end();
                        next(val);
                    });
                },
                error: (err) => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec( () => {
                        childLogger.error(err);
                        childLogger.end();
                        error(err);
                    });
                },
                complete:  () => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(() => {
                        childLogger.complete();
                        childLogger.end();
                        complete();
                    });
                }
            }, producerId);
            // Stop timers on unsubscribe
            return () => {
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
    debounceTime (delayInMs:number) {
        
        var name = "debounceTime(" + delayInMs + ")";
        ;
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var running:any;
            // Start delayed execution
            function delayedExec(then:(()=>any), childLogger:ChildLogger) {
                // Cancel Previous
                if (running)
                    running.dispose();
                // Start Delayed function
                var cancellationToken = setTimeout(() => {
                    running = undefined;
                    then();
                    childLogger.end();
                }, delayInMs);
                running = {
                    dispose: () => {
                        clearTimeout(cancellationToken);
                        childLogger.end();
                    }
                };
            }
            ;
            var unsubscribe = this.subscribe({
                next: (val) => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(() => {
                        childLogger.value(val);
                        childLogger.complete();
                        next(val);
                    }, childLogger);
                },
                error: (err) => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(() => {
                        childLogger.error(err);
                        error(err);
                    }, childLogger);
                },
                complete: () => {
                    var childLogger = this.createChildLogger(producerId);
                    childLogger.start();
                    delayedExec(() => {
                        childLogger.complete();
                        complete();
                    }, childLogger);
                }
            }, producerId);
            // Stop timers on unsubscribe
            return () => {
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
    throttleTime (duration:number) {
        
        var name = "throttleTime(" + duration + ")";
        ;
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var running:any;
            // Start delayed execution
            function delayedExec(then:(()=>void), childLogger:ChildLogger) {
                // Cancel Previous
                if (running)
                    running.dispose();
                // Start Delayed function
                var cancellationToken = setTimeout(() => {
                    running = undefined;
                    then();
                    childLogger.end();
                }, duration);
                running = {
                    dispose: () => {
                        clearTimeout(cancellationToken);
                        childLogger.end();
                    }
                };
            }
            ;
            var unsubscribe = this.subscribe({
                next: (val) => {
                    // Only emit if time passed
                    if (!running) {
                        var childLogger_1 = this.createChildLogger(producerId);
                        childLogger_1.start();
                        delayedExec(() => {
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
                complete: () => {
                    if (running)
                        running.dispose();
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return () => {
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
    bufferTime (bufferTimeSpan:number) {
        
        var name = "bufferTime(" + bufferTimeSpan + ")";
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var values:Array<any> = [];
            var childLogger = this.createChildLogger(producerId, false);
            childLogger.start();
            // TODO: how to handle pause without schedulers
            var cancellationToken = setInterval(() => {
                childLogger.value(values);
                childLogger.complete();
                childLogger.end();
                // Emit buffered items
                if (values.length > 0)
                    next(values);
                // Reset
                values = [];
                // Restart
                childLogger = this.createChildLogger(producerId, false);
                childLogger.start();
            }, bufferTimeSpan);
            var unsubscribe = this.subscribe({
                next: (val) => { return values.push(val); },
                error: function (err) {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    error(err);
                },
                complete: () => {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return () => {
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
    sampleTime (period:number) {
        
        var name = "sampleTime(" + period + ")";
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue = false;
            var lastValue:any;
            var childLogger = this.createChildLogger(producerId, false);
            childLogger.start();
            // TODO: how to handle pause without schedulers
            var cancellationToken = setInterval(() => {
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
                childLogger = this.createChildLogger(producerId, false);
                childLogger.start();
            }, period);
            var unsubscribe = this.subscribe({
                next: (val) => {
                    hasValue = true;
                    lastValue = val;
                },
                error: function (err) {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    error(err);
                },
                complete: () => {
                    if (cancellationToken)
                        clearInterval(cancellationToken);
                    complete();
                }
            }, producerId);
            // Stop timers on unsubscribe
            return () => {
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
    startWith () {
        
        var values:Array<any> = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            if (values)
                values.forEach(next);
            // Subscribe to stream1
            return this.subscribe({
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
    concat (stream:Observable) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            // Subscribe to stream1
            let unsubscribe = this.subscribe({
                next: next,
                error: error,
                complete: () => {
                    // Start second observable// Subscribe to stream1
                    unsubscribe = stream.subscribe({
                        next: next,
                        error: error,
                        complete: complete
                    }, producerId);
                }
            }, producerId);
            return () => {
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
    merge (stream:Observable) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var error1:any;
            var isCompleted1 = false;
            var error2:any;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = this.subscribe({
                next: next,
                error: function (err) {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        error(err);
                    error1 = err;
                },
                complete: () => {
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
                complete: () => {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return () => {
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
    combineLatest (stream:Observable, combineFn:( (v1:any, v2:any) => any)) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue1 = false;
            var lastValue1:any;
            var error1:any;
            var isCompleted1 = false;
            var hasValue2 = false;
            var lastValue2:any;
            var error2:any;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = this.subscribe({
                next: (val) => {
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
                complete: () => {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        complete(); // Both complete?
                    isCompleted1 = true;
                }
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: (val) => {
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
                complete: () => {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return () => {
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
    withLatestFrom (stream:Observable, combineFn:( (v1:any, v2:any) => any)) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var hasValue2 = false;
            var lastValue2:any;
            // Subscribe to stream1
            var unsubscribe1 = this.subscribe({
                next: (val) => {
                    // Only emit if we have a value from second stream
                    if (hasValue2)
                        next(combineFn(val, lastValue2));
                },
                error: error,
                complete: complete
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: (val) => {
                    hasValue2 = true;
                    lastValue2 = val;
                },
                error: function (err) {
                    error(err);
                },
                complete: () => { }
            }, producerId);
            return () => {
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
    zip (stream:Observable, combineFn:( (v1:any, v2:any) => any)) {
        
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var lastValues1:Array<any> = [];
            var error1:any;
            var isCompleted1 = false;
            var lastValues2:Array<any>= [];
            var error2:any;
            var isCompleted2 = false;
            // Subscribe to stream1
            var unsubscribe1 = this.subscribe({
                next: (val) => {
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
                complete: () => {
                    if (error2)
                        error(error2); // First error
                    if (isCompleted2)
                        complete(); // Both complete?
                    isCompleted1 = true;
                }
            }, producerId);
            // Subscribe to stream2
            var unsubscribe2 = stream.subscribe({
                next: (val) => {
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
                complete: () => {
                    if (error1)
                        error(error1); // First error
                    if (isCompleted1)
                        complete(); // Both complete?
                    isCompleted2 = true;
                }
            }, producerId);
            return () => {
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
    mergeMap (projectionStream:( (val:any) => Observable)) {
        
        if (!projectionStream)
            throw new Error('mergeMap requires a projectionStream function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribes:Array<any> = [];
            var unsubscribe = this.subscribe({
                next: (val) => {
                    var observable = projectionStream(val);
                    if (!observable || !observable.subscribe)
                        throw new Error('switchMap projectionStream should return an observable');
                    var unsubscribe = this.logAndSubscribeToObservable(observable, {
                        next: (val:any) => next(val),
                        error: error,
                        complete: () =>  <any>undefined // don't complete switchMap if observable completes
                    }, producerId, true);
                    unsubscribes.push(unsubscribe);
                },
                error: error,
                complete: complete
            }, producerId);
            // Unsubscribe with children
            return () => {
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
    concatMap (projectionStream:( (val:any) => Observable)) {
        
        if (!projectionStream)
            throw new Error('concatMap requires a projectionStream function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var queuedValues:Array<any> = [];
            var valueUnsubscribe:any = undefined;
            var runObservable = (value:any, first = false) => {
                // Is busy
                if (valueUnsubscribe) {
                    queuedValues.push(value);
                }
                else {
                    var observable = projectionStream(value);
                    if (!observable || !observable.subscribe)
                        throw new Error('concatMap projectionStream should return an observable');
                    valueUnsubscribe = this.logAndSubscribeToObservable(observable, {
                        next: (val:any) => next(val),
                        error: error,
                        complete: () => {
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
            var mainUnsubscribe = this.subscribe({
                next: (val) => {
                    runObservable(val, true);
                },
                error: error,
                complete: complete
            }, producerId);
            // Unsubscribe with children
            return () => {
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
    switchMap (projectionStream:( (val:any) => Observable)) {
        
        if (!projectionStream)
            throw new Error('switchMap requires a projectionStream function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribe:any;
            return this.subscribe({
                next: (val) => {
                    if (unsubscribe)
                        unsubscribe(); // Unsubscribe previous
                    var observable = projectionStream(val);
                    if (!observable || !observable.subscribe)
                        throw new Error('switchMap projectionStream should return an observable');
                    unsubscribe = this.logAndSubscribeToObservable(observable, {
                        next: (val:any) => next(val),
                        error: error,
                        complete: () => <any>undefined // don't complete switchMap if observable completes
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
    exhaustMap (projectionStream:( (val:any) => Observable)) {
        
        if (!projectionStream)
            throw new Error('switchMap requires a projectionStream function');
        return this.create((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            var unsubscribe:any;
            return this.subscribe({
                next: (val) => {
                    if (!unsubscribe) {
                        var observable = projectionStream(val);
                        if (!observable || !observable.subscribe)
                            throw new Error('switchMap projectionStream should return an observable');
                        unsubscribe = this.logAndSubscribeToObservable(observable, {
                            next: (val:any) => next(val),
                            error: error,
                            complete: () => {
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
    
}

