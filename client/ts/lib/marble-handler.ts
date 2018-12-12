namespace rxmarbles {

export type SampleInfo = { 
    type: SampleItemType;
}
export enum SampleItemType {
    Start, Value, Error, Complete, Stop
}
export interface SampleBase {
    id: string,
    parentId?: string,
    name: string,
}
export interface SampleStart extends SampleBase {
    createdByValue: boolean,
    isIntermediate: boolean,

}
export type SampleStop = SampleBase;

export type SampleComplete = SampleBase;

export interface SampleValue extends SampleBase {
    value:any
}
export interface SampleError extends SampleBase {
    err:any
}
export function onStart( p:SampleStart ) {
    window.dispatchEvent( new CustomEvent( "rxmarbles.start", { detail:p } ));
}
export function onStop( p:SampleStop ) {
    window.dispatchEvent( new CustomEvent( "rxmarbles.stop", { detail:p } ));
}
export function onValue( p:SampleValue ) {
    window.dispatchEvent( new CustomEvent( "rxmarbles.value", { detail:p } ));
}
export function onError( p:SampleError ) {
    window.dispatchEvent( new CustomEvent( "rxmarbles.error", { detail:p } ));
}
export function onComplete( p:SampleComplete ) {
    window.dispatchEvent( new CustomEvent( "rxmarbles.complete", { detail:p } ));
}


export interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

export class SamplerLogger {
    lastSample:Array<Sample> = [];

    constructor( private ticker:Observable<number> ) {

        window.addEventListener( "rxmarbles.start",  e  => {
            let ce = e as CustomEvent<SampleStart>;

            console.log( "rxmarbles.start", ce.detail );

            this.lastSample.push({
                type:           SampleItemType.Start,
                id:             ce.detail.id,
                parentId:       ce.detail.parentId,
                name:           ce.detail.name,
                createdByValue: ce.detail.createdByValue,
                isIntermediate: ce.detail.isIntermediate
            });
    
        });

        //onStop(id:string, name:string, parentId:string);
        window.addEventListener( "rxmarbles.stop",  e  => {

            let ce = e as CustomEvent<SampleStop>;

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

            let ce = e as CustomEvent<SampleValue>;

            console.log( "rxmarbles.value", ce.detail );

            this.lastSample.push({
                type:       SampleItemType.Value,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name,
                value:      ce.detail.value
            });
        });

        //onError(err:any, id:string, name:string, parentId:string) {
        window.addEventListener( "rxmarbles.error",  e  => {

                let ce = e as CustomEvent<SampleError>;
    
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

            let ce = e as CustomEvent<SampleComplete>;

            console.log( "rxmarbles.complete", ce.detail );

            this.lastSample.push({
                type:       SampleItemType.Complete,
                id:         ce.detail.id,
                parentId:   ce.detail.parentId,
                name:       ce.detail.name
            });
        });
        
    }

    static isStart( info:SampleInfo  ) {
        return info && info.type === SampleItemType.Start;
    }
    static isValue(info:SampleInfo ) {
        return info && info.type === SampleItemType.Value;
    };
    static isError(info:SampleInfo ) {
        return info && info.type === SampleItemType.Error;
    };
    static isComplete(info:SampleInfo) {
        return info && info.type === SampleItemType.Complete;
    };
    static isStop(info:SampleInfo ) {
        return info && info.type === SampleItemType.Stop;
    };

    getSamples() {
        return new Observable((_a:Observer<Sample[]>) => {
            let next = _a.next, error = _a.error, complete = _a.complete;
            return this.ticker.subscribe({
                next: ( val:any ) => {

                    next(this.lastSample);

                    this.lastSample = [];
                },
                error: error,
                complete: complete
            });
        });
    };
    

}

}