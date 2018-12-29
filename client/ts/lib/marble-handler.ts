import { Observable, Subject, Observer, PartialObserver  } from 'rxjs';
import { bufferTime, map, tap, filter, takeWhile } from 'rxjs/operators';

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

const noneFilledShapes  = ['□', '△', '○', '▷', '☆'];
const filledShapes      = ['■', '▲', '●', '▶', '★'];

//let eventTime = () => (performance) ? performance.now() : Date.now() ;
class StreamsInfo {
    [ id:string ]:number;

}

let _ids:StreamsInfo = {}

var _eventSeq = 0;

//let eventTime = () => (performance) ? performance.now() : Date.now() ;

let eventTime = () => ++_eventSeq;

/**
 * 
 * @param observer 
 * @param id 
 * @param parentId 
 */
export function observeAndNotify<T>( observer:Observer<T> , id:string, parentId?:string ):PartialObserver<T> 
{

    const _id =  (() => {
        if( _ids[id]===undefined ) {
            _ids[id] = 0;
            return id;
        }
        return id + String(++_ids[id]);
    })();

    const event:Sample = {
        type: SampleItemType.Start,
        time: eventTime(),
        id:_id,
        parentId:parentId,
        name:_id,
        createdByValue: true,
        isIntermediate:false
    };
    window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));

    return {
        next: (v:any) => {
            const event:Sample = {
                type: SampleItemType.Value,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id,
                value: v
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.next(v);
        },
        error: (err:any) => {
            console.log( id, parentId, name, err );
            const event:Sample = {
                type: SampleItemType.Error,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id,
                err:err
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.error(err);
        },
        complete: () => {
            const event:Sample = {
                type: SampleItemType.Complete,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.complete();
        }
    }
};


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

    getSamples( sampleFilter:( (s:Sample) => boolean), tickTime:number = 1000 ):Observable<Sample[]> {

        let sort = (a:SampleInfo,b:SampleInfo) => {
            let timeDiff = b.time - a.time ;
            if( timeDiff !== 0 ) return timeDiff;
            return b.type - a.type; 

        }

        return this.samples
                .pipe( takeWhile( sample => sample.type!=SampleItemType.Complete || sample.parentId!=undefined) )
                .pipe( filter( sampleFilter)  )
                .pipe( bufferTime( tickTime ), map( s => s.sort( sort ) ))
                ;
    }
    

}

