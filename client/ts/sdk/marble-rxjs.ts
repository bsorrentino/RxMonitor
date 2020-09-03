/// <reference path="../lib/marble-diagram-element.d.ts" />

import {  
    Observable, 
    MonoTypeOperatorFunction,
    PartialObserver,
    Observer
} from 'rxjs';

import { SampleItemType, Sample } from '../lib/marble-types';

export function watch<T>( parentId:string, id?:string ):MonoTypeOperatorFunction<T> {

    return (source:Observable<T>) => new Observable<T>( observer =>  {

        return source.subscribe(observeAndNotify( observer, id || parentId, id ? parentId : undefined ) );
    })
}

class StreamsInfo {
    [ id:string ]:number;

}

let _ids:StreamsInfo = {}

//var _eventSeq = 0;
//let eventTime = () => ++_eventSeq;

let eventTime = () => (performance) ? performance.now() : Date.now() ;


/**
 * 
 * @param observer 
 * @param id 
 * @param parentId 
 */
export function observeAndNotify<T>( observer:Observer<T> , id:string, parentId?:string ):PartialObserver<T> 
{
    console.debug( `id='${id}', parentId='${parentId}'` );

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


