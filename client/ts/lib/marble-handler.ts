/// <reference path='./marble-element.d.ts' />

import { Observer, PartialObserver  } from 'rxjs';

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



