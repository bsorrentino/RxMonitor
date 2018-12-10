"use strict";
var rxmarbles;
(function (rxmarbles) {
    class ObservableBase {
        /*
        private static _logger:SamplerLogger;
        static get logger() {
            return ObservableBase._logger;
        }
        static set logger(v:SamplerLogger) {
            ObservableBase._logger = v;
        }
        */
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
        // Show inner stream created by a value (example: delay, switchMap)
        createChildLogger(producerId, createdByValue = true) {
            let id = ObservableBase.getProducerId();
            var createdById = producerId || '';
            var isStopped = false;
            return {
                start: () => {
                    //id:string, name:string, parentId:string, createdByValue:any, isIntermediate:an
                    let event = new CustomEvent("rxmarbles.start", { detail: { id: id,
                            name: '',
                            parentId: createdById,
                            createdByValue: createdByValue,
                            isIntermediate: true }
                    });
                    window.dispatchEvent(event);
                },
                value: (val) => {
                    let event = new CustomEvent("rxmarbles.value", { detail: { id: id,
                            name: '',
                            parentId: createdById,
                            value: val,
                        }
                    });
                    window.dispatchEvent(event);
                },
                error: (err) => {
                    let event = new CustomEvent("rxmarbles.value", { detail: { id: id,
                            name: '',
                            parentId: createdById,
                            err: err,
                        }
                    });
                    window.dispatchEvent(event);
                    if (!isStopped) {
                        isStopped = true;
                    }
                },
                complete: () => {
                    let event = new CustomEvent("rxmarbles.complete", { detail: { id: id,
                            name: '',
                            parentId: createdById
                        }
                    });
                    window.dispatchEvent(event);
                    if (!isStopped) {
                        isStopped = true;
                    }
                },
                end: () => {
                    if (!isStopped) {
                        isStopped = true;
                    }
                    let event = new CustomEvent("rxmarbles.stop", { detail: { id: id,
                            name: '',
                            parentId: createdById
                        }
                    });
                    window.dispatchEvent(event);
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
