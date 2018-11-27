/** Class Created to hide some logging stuff */
var ObservableBase = (function () {
    function ObservableBase(name, isCreatedByValue) {
        if (name === void 0) { name = ''; }
        if (isCreatedByValue === void 0) { isCreatedByValue = false; }
        this.name = name || '';
        this.isCreatedByValue = isCreatedByValue;
        this.logger = Observable.logger;
    }
    /** Get ID on subscription, an Observable start a new stream each time so id changes */
    ObservableBase.getProducerId = function () {
        return "" + ObservableBase.lastId++;
    };
    // Show inner stream created by a value (example: delay, switchMap)
    ObservableBase.prototype.createChildLogger = function (producerId, createdByValue) {
        if (createdByValue === void 0) { createdByValue = true; }
        var createdById = producerId || '';
        var id = ObservableBase.getProducerId();
        var logger = Observable.logger;
        var isStopped = false;
        return {
            start: function () { return logger ? logger.onStart(id, '', createdById, createdByValue, true) : undefined; },
            value: function (val) {
                if (logger)
                    logger.onValue(val, id, '', createdById);
            },
            error: function (err) {
                if (logger) {
                    logger.onError(err, id, '', createdById);
                    if (!isStopped) {
                        isStopped = true;
                        //logger.onStop(id, '', createdById);
                    }
                }
            },
            complete: function () {
                if (logger) {
                    logger.onComplete(id, '', createdById);
                    if (!isStopped) {
                        isStopped = true;
                        //logger.onStop(id, '', createdById);
                    }
                }
            },
            end: function () {
                if (logger && !isStopped) {
                    isStopped = true;
                    logger.onStop(id, '', createdById);
                }
            }
        };
    };
    // TODO
    ObservableBase.prototype.logAndSubscribeToObservable = function (observable, observer, producerId, createdByValue) {
        if (createdByValue === void 0) { createdByValue = true; }
        if (observable && observable.subscribe) {
            var childLogger_1 = this.createChildLogger(producerId, createdByValue);
            childLogger_1.start();
            var unsubscribe_1 = observable.subscribe({
                next: function (val) {
                    observer.next(val);
                    childLogger_1.value(val);
                },
                error: function (err) {
                    observer.error(err);
                    childLogger_1.error(err);
                },
                complete: function () {
                    observer.complete();
                    childLogger_1.complete();
                }
            }, producerId);
            return function () {
                unsubscribe_1();
                childLogger_1.end();
            };
        }
        return observable.subscribe(observable);
    };
    return ObservableBase;
}());
//========================================
// STATIC
//----------------------------------------
ObservableBase.lastId = 1;
//# sourceMappingURL=ObservableBase.js.map