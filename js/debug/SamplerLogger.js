var SampleItemType;
(function (SampleItemType) {
    SampleItemType[SampleItemType["Start"] = 1] = "Start";
    SampleItemType[SampleItemType["Value"] = 2] = "Value";
    SampleItemType[SampleItemType["Error"] = 3] = "Error";
    SampleItemType[SampleItemType["Complete"] = 4] = "Complete";
    SampleItemType[SampleItemType["Stop"] = 5] = "Stop";
})(SampleItemType || (SampleItemType = {}));
;
/**
 * Collect logged SampleItems during the sample period
 */
var SamplerLogger = (function () {
    function SamplerLogger(samplerTicker) {
        this.ticker = samplerTicker;
        this.lastSample = [];
    }
    SamplerLogger.isStartSampleItem = function (info) {
        return info && info.type === SampleItemType.Start;
    };
    SamplerLogger.isValueSampleItem = function (info) {
        return info && info.type === SampleItemType.Value;
    };
    SamplerLogger.isErrorSampleItem = function (info) {
        return info && info.type === SampleItemType.Error;
    };
    SamplerLogger.isCompleteSampleItem = function (info) {
        return info && info.type === SampleItemType.Complete;
    };
    SamplerLogger.isStopSampleItem = function (info) {
        return info && info.type === SampleItemType.Stop;
    };
    SamplerLogger.prototype.getSample = function () {
        return this.lastSample;
    };
    SamplerLogger.prototype.getSamples = function () {
        var _this = this;
        return new Observable(function (_a) {
            var next = _a.next, error = _a.error, complete = _a.complete;
            return _this.ticker.subscribe({
                next: function () {
                    next(_this.getSample());
                    _this.lastSample = [];
                },
                error: error,
                complete: complete
            });
        });
    };
    SamplerLogger.prototype.onStart = function (id, name, parentId, createdByValue, isIntermediate) {
        this.lastSample.push({
            type: SampleItemType.Start,
            id: id,
            parentId: parentId,
            name: name,
            createdByValue: createdByValue,
            isIntermediate: isIntermediate,
        });
    };
    SamplerLogger.prototype.onValue = function (value, id, name, parentId) {
        this.lastSample.push({
            type: SampleItemType.Value,
            id: id,
            parentId: parentId,
            name: name,
            value: value,
        });
    };
    SamplerLogger.prototype.onError = function (err, id, name, parentId) {
        this.lastSample.push({
            type: SampleItemType.Error,
            id: id,
            parentId: parentId,
            name: name,
            err: err
        });
    };
    SamplerLogger.prototype.onComplete = function (id, name, parentId) {
        this.lastSample.push({
            type: SampleItemType.Complete,
            id: id,
            parentId: parentId,
            name: name
        });
    };
    SamplerLogger.prototype.onStop = function (id, name, parentId) {
        this.lastSample.push({
            type: SampleItemType.Stop,
            id: id,
            parentId: parentId,
            name: name
        });
    };
    return SamplerLogger;
}());
//# sourceMappingURL=SamplerLogger.js.map