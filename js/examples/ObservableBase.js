"use strict";
var rxmarbles;
(function (rxmarbles) {
    class ObservableBase {
        /**
         *
         * @param name
         * @param isCreatedByValue
         */
        constructor(name, isCreatedByValue = false) {
            this.name = name;
            this.isCreatedByValue = isCreatedByValue;
        }
        static getProducerId() {
            return String(ObservableBase.lastId++);
        }
        static get logger() {
            return ObservableBase._logger;
        }
        static set logger(v) {
            //console.log( "SET LOGGER", v);
            ObservableBase._logger = v;
        }
        // Show inner stream created by a value (example: delay, switchMap)
        createChildLogger(producerId, createdByValue = true) {
            let id = ObservableBase.getProducerId();
            var createdById = producerId || '';
            let logger = ObservableBase.logger;
            var isStopped = false;
            return {
                start: () => logger ? logger.onStart(id, '', createdById, createdByValue, true) : undefined,
                value: (val) => {
                    if (logger)
                        logger.onValue(val, id, '', createdById);
                },
                error: (err) => {
                    if (logger) {
                        logger.onError(err, id, '', createdById);
                        if (!isStopped) {
                            isStopped = true;
                        }
                    }
                },
                complete: () => {
                    if (logger) {
                        logger.onComplete(id, '', createdById);
                        if (!isStopped) {
                            isStopped = true;
                        }
                    }
                },
                end: () => {
                    if (logger && !isStopped) {
                        isStopped = true;
                        logger.onStop(id, '', createdById);
                    }
                }
            };
        }
        logAndSubscribeToObservable(observable, observer, producerId, createdByValue = true) {
            if (observable && observable.subscribe) {
                var childLogger = this.createChildLogger(producerId, createdByValue);
                childLogger.start();
                var unsubscribe = observable.subscribe({
                    next: (val) => {
                        observer.next(val);
                        childLogger.value(val);
                    },
                    error: (err) => {
                        observer.error(err);
                        childLogger.error(err);
                    },
                    complete: () => {
                        observer.complete();
                        childLogger.complete();
                    }
                }, producerId);
                return () => {
                    unsubscribe();
                    childLogger.end();
                };
            }
            return observable.subscribe(observer);
        }
        ;
    }
    ObservableBase.lastId = 1;
    rxmarbles.ObservableBase = ObservableBase;
})(rxmarbles || (rxmarbles = {}));
