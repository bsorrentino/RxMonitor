interface Observable {
    subscribe( next:any, error?:any, complete?:any ):any;
};

declare var Observable: {
    new ( subscribe:any ):Observable;
}

type Info = { 
    type: SampleItemType;
}
enum SampleItemType {
    Start, Value, Error, Complete, Stop
}

interface Sample {
        type: SampleItemType,
        id: string,
        parentId: string,
        name: string,
        err?:any,
        value?:any,
        createdByValue?: any,
        isIntermediate?: any,
}

class SamplerLogger {
    lastSample:Array<Sample> = [];

    constructor( private ticker:Observable ) {
    }

    static isStartSampleItem( info:Info  ) {
        return info && info.type === SampleItemType.Start;
    }
    static isValueSampleItem(info:Info ) {
        return info && info.type === SampleItemType.Value;
    };
    static isErrorSampleItem(info:Info ) {
        return info && info.type === SampleItemType.Error;
    };
    static isCompleteSampleItem(info:Info) {
        return info && info.type === SampleItemType.Complete;
    };
    static isStopSampleItem(info:Info ) {
        return info && info.type === SampleItemType.Stop;
    };

    getSamples() {
        return new Observable((_a:any) => {
            var next = _a.next, error = _a.error, complete = _a.complete;
            return this.ticker.subscribe({
                next: () => {
                    next(this.getSample());
                    this.lastSample = [];
                },
                error: error,
                complete: complete
            });
        });
    };
    
    onStart(id:string, name:string, parentId:string, createdByValue:any, isIntermediate:any) {
        this.lastSample.push({
            type: SampleItemType.Start,
            id: id,
            parentId: parentId,
            name: name,
            createdByValue: createdByValue,
            isIntermediate: isIntermediate,
        });
    };
    onValue(value:any, id:string, name:string, parentId:string) {
        this.lastSample.push({
            type: SampleItemType.Value,
            id: id,
            parentId: parentId,
            name: name,
            value: value,
        });
    };
    onError(err:any, id:string, name:string, parentId:string) {
        this.lastSample.push({
            type: SampleItemType.Error,
            id: id,
            parentId: parentId,
            name: name,
            err: err
        });
    };
    onComplete(id:string, name:string, parentId:string) {
        this.lastSample.push({
            type: SampleItemType.Complete,
            id: id,
            parentId: parentId,
            name: name
        });
    };
    onStop(id:string, name:string, parentId:string) {
        this.lastSample.push({
            type: SampleItemType.Stop,
            id: id,
            parentId: parentId,
            name: name
        });
    };

}
