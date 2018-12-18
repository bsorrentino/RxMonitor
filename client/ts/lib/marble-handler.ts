import { Observable, Subscriber, Subject } from 'rxjs';
import { bufferTime, map, tap, filter } from 'rxjs/operators';

export type SampleInfo = { 
    type: SampleItemType;
    time:number;
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

export interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

export class SamplerLogger {
    samples = new Subject<Sample>();  


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

    constructor( ) {  

        window.addEventListener( 'rxmarbles.event', (event:any) => {
            this.samples.next( event.detail );
        });
    }

    onStart( p:SampleStart ) {
        this.samples.next( Object.assign( { type:SampleItemType.Start, time:Date.now() }, p ));
    }
    onStop( p:SampleStop ) {
        this.samples.next( Object.assign( { type:SampleItemType.Stop, time:Date.now()}, p ));
    }
    onValue( p:SampleValue ) {
        this.samples.next( Object.assign( { type:SampleItemType.Value, time:Date.now()}, p ));
    }
    onError( p:SampleError ) {
        this.samples.next( Object.assign( { type:SampleItemType.Error, time:Date.now()}, p ));
    }
    onComplete( p:SampleComplete ) {
        this.samples.next( Object.assign( { type:SampleItemType.Complete, time:Date.now()}, p ));
    }
    

    getSamples( sampleFilter:( (s:Sample) => boolean), tickTime:number = 1000 ):Observable<Sample[]> {

        let sort = (a:SampleInfo,b:SampleInfo) => {
            let timeDiff = b.time - a.time ;
            if( timeDiff !== 0 ) return timeDiff;
            return b.type - a.type; 

        }

        let _log = tap( (v) => console.log( 'value', v), err => {}, () => console.log( 'complete'));
        return this.samples
                .pipe( filter( sampleFilter)  )
                .pipe( bufferTime( tickTime ), map( s => s.sort( sort ) ))
                //.pipe( _log )
                ;
    }
    

}

