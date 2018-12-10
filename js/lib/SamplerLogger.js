"use strict";
var rxmarbles;
(function (rxmarbles) {
    let SampleItemType;
    (function (SampleItemType) {
        SampleItemType[SampleItemType["Start"] = 0] = "Start";
        SampleItemType[SampleItemType["Value"] = 1] = "Value";
        SampleItemType[SampleItemType["Error"] = 2] = "Error";
        SampleItemType[SampleItemType["Complete"] = 3] = "Complete";
        SampleItemType[SampleItemType["Stop"] = 4] = "Stop";
    })(SampleItemType = rxmarbles.SampleItemType || (rxmarbles.SampleItemType = {}));
    class SamplerLogger {
        constructor(ticker) {
            this.ticker = ticker;
            this.lastSample = [];
        }
        static isStartSampleItem(info) {
            return info && info.type === SampleItemType.Start;
        }
        static isValueSampleItem(info) {
            return info && info.type === SampleItemType.Value;
        }
        ;
        static isErrorSampleItem(info) {
            return info && info.type === SampleItemType.Error;
        }
        ;
        static isCompleteSampleItem(info) {
            return info && info.type === SampleItemType.Complete;
        }
        ;
        static isStopSampleItem(info) {
            return info && info.type === SampleItemType.Stop;
        }
        ;
        getSample() { return this.lastSample; }
        getSamples() {
            return new rxmarbles.Observable((_a) => {
                var next = _a.next, error = _a.error, complete = _a.complete;
                return this.ticker.subscribe({
                    next: (val) => {
                        let sample = this.getSample();
                        //console.log( "getSamples", sample);
                        next(sample);
                        this.lastSample = [];
                    },
                    error: error,
                    complete: complete
                });
            });
        }
        ;
        onStart(id, name, parentId, createdByValue, isIntermediate) {
            //console.log( "onStart", name );
            this.lastSample.push({
                type: SampleItemType.Start,
                id: id,
                parentId: parentId,
                name: name,
                createdByValue: createdByValue,
                isIntermediate: isIntermediate,
            });
        }
        ;
        onValue(value, id, name, parentId) {
            //console.log( "onValue", name );
            this.lastSample.push({
                type: SampleItemType.Value,
                id: id,
                parentId: parentId,
                name: name,
                value: value,
            });
        }
        ;
        onError(err, id, name, parentId) {
            //console.log( "onError", name );
            this.lastSample.push({
                type: SampleItemType.Error,
                id: id,
                parentId: parentId,
                name: name,
                err: err
            });
        }
        ;
        onComplete(id, name, parentId) {
            //console.log( "onComplete", name );
            this.lastSample.push({
                type: SampleItemType.Complete,
                id: id,
                parentId: parentId,
                name: name
            });
        }
        ;
        onStop(id, name, parentId) {
            //console.log( "onStop", name );
            this.lastSample.push({
                type: SampleItemType.Stop,
                id: id,
                parentId: parentId,
                name: name
            });
        }
        ;
    }
    rxmarbles.SamplerLogger = SamplerLogger;
})(rxmarbles || (rxmarbles = {}));
