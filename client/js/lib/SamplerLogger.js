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
            window.addEventListener("rxmarbles.start", e => {
                let ce = e;
                console.log("rxmarbles.start", ce.detail);
                this.lastSample.push({
                    type: SampleItemType.Start,
                    id: ce.detail.id,
                    parentId: ce.detail.parentId,
                    name: ce.detail.name,
                    createdByValue: ce.detail.createdByValue,
                    isIntermediate: ce.detail.isIntermediate,
                });
            });
            //onStop(id:string, name:string, parentId:string);
            window.addEventListener("rxmarbles.stop", e => {
                let ce = e;
                console.log("rxmarbles.stop", ce.detail);
                this.lastSample.push({
                    type: SampleItemType.Stop,
                    id: ce.detail.id,
                    parentId: ce.detail.parentId,
                    name: ce.detail.name
                });
            });
            //onValue(value:string, id:string, name:string, parentId:string)
            window.addEventListener("rxmarbles.value", e => {
                let ce = e;
                console.log("rxmarbles.value", ce.detail);
                this.lastSample.push({
                    type: SampleItemType.Value,
                    id: ce.detail.id,
                    parentId: ce.detail.parentId,
                    name: ce.detail.name,
                    value: ce.detail.value,
                });
            });
            //onError(err:any, id:string, name:string, parentId:string) {
            window.addEventListener("rxmarbles.error", e => {
                let ce = e;
                console.log("rxmarbles.error", ce.detail);
                this.lastSample.push({
                    type: SampleItemType.Error,
                    id: ce.detail.id,
                    parentId: ce.detail.parentId,
                    name: ce.detail.name,
                    err: ce.detail.err
                });
            });
            //onComplete(id:string, name:string, parentId:string) {
            window.addEventListener("rxmarbles.complete", e => {
                let ce = e;
                console.log("rxmarbles.complete", ce.detail);
                this.lastSample.push({
                    type: SampleItemType.Complete,
                    id: ce.detail.id,
                    parentId: ce.detail.parentId,
                    name: ce.detail.name
                });
            });
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
                let next = _a.next, error = _a.error, complete = _a.complete;
                return this.ticker.subscribe({
                    next: (val) => {
                        let sample = this.getSample();
                        next(sample);
                        this.lastSample = [];
                    },
                    error: error,
                    complete: complete
                });
            });
        }
        ;
    }
    rxmarbles.SamplerLogger = SamplerLogger;
})(rxmarbles || (rxmarbles = {}));
