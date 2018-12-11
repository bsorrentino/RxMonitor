namespace rxmarbles {

export type Info = { 
    type: SampleItemType;
}
export enum SampleItemType {
    Start, Value, Error, Complete, Stop
}

export interface Sample {
        type: SampleItemType,
        id: string,
        parentId: string,
        name: string,
        err?:any,
        value?:any,
        createdByValue?: any,
        isIntermediate?: any,
}

export class SamplerLogger {
    lastSample:Array<Sample> = [];

    constructor( private ticker:Observable ) {

        window.addEventListener( "rxmarbles.start",  e  => {
            let ce = e as CustomEvent<any>;

            console.log( "rxmarbles.start", ce.detail );

            this.lastSample.push({
                type:           SampleItemType.Start,
                id:             ce.detail.id,
                parentId:       ce.detail.parentId,
                name:           ce.detail.name,
                createdByValue: ce.detail.createdByValue,
                isIntermediate: ce.detail.isIntermediate,
            });
    
        });

        //onStop(id:string, name:string, parentId:string);
        window.addEventListener( "rxmarbles.stop",  e  => {

            let ce = e as CustomEvent<any>;

            console.log( "rxmarbles.stop", ce.detail );

            this.lastSample.push({
                type:       SampleItemType.Stop,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name
            });
        });
    
        //onValue(value:string, id:string, name:string, parentId:string)
        window.addEventListener( "rxmarbles.value",  e  => {

            let ce = e as CustomEvent<any>;

            console.log( "rxmarbles.value", ce.detail );

            this.lastSample.push({
                type:       SampleItemType.Value,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name,
                value:      ce.detail.value,
            });
        });

        //onError(err:any, id:string, name:string, parentId:string) {
        window.addEventListener( "rxmarbles.error",  e  => {

                let ce = e as CustomEvent<any>;
    
                console.log( "rxmarbles.error", ce.detail );
    
                this.lastSample.push({
                type:       SampleItemType.Error,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name,
                err:        ce.detail.err
            });
        });
        //onComplete(id:string, name:string, parentId:string) {
        window.addEventListener( "rxmarbles.complete",  e  => {

            let ce = e as CustomEvent<any>;

            console.log( "rxmarbles.complete", ce.detail );

            this.lastSample.push({
                type:       SampleItemType.Complete,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name
            });
        });
        
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

    getSample() { return this.lastSample; }

    getSamples() {
        return new Observable((_a:Observer) => {
            let next = _a.next, error = _a.error, complete = _a.complete;
            return this.ticker.subscribe({
                next: ( val:any ) => {

                    let sample = this.getSample();

                    next(sample);

                    this.lastSample = [];
                },
                error: error,
                complete: complete
            });
        });
    };
    

}

}