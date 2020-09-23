import {  
    Observable, 
    MonoTypeOperatorFunction,
    PartialObserver,
    Subscriber
} from 'rxjs';

interface StreamsInfo {
    [ id:string ]:number;
}

let eventTime = () => (performance) ? performance.now() : Date.now() ;

class StreamNameManager {
    
    _ids:StreamsInfo = {}

    reset() { this._ids = {} } 

    getName( theId:string ) {
        if( this._ids[theId]===undefined ) {
            this._ids[theId] = 0;
            return theId;
        }
        return theId + String(++this._ids[theId]);
    }
}

const globalStreamNameManager = new StreamNameManager()

/**
 * 
 * @param idOrParentId 
 * @param id 
 */
export function watch<T>( idOrParentId:string, id?:string ):MonoTypeOperatorFunction<T> {

    if( !id ) globalStreamNameManager.reset()

    return (source:Observable<T>) =>  

        source.lift( function (this: Subscriber<T>, source: Observable<T>) {

            const subscription =  source.subscribe( observeAndNotify( this, id || idOrParentId, id ? idOrParentId : undefined ) );

            return () => {
                //console.debug( `unsubscribe( id='${id || idOrParentId}', parentId='${id ? idOrParentId : undefined}' )` );
                //subscription.unsubscribe()
            }
        })
}


/**
 * 
 * @param subscriber 
 * @param id 
 * @param parentId 
 */
function observeAndNotify<T>( subscriber:Subscriber<T>, id:string, parentId?:string ):PartialObserver<T> 
{
    console.debug( `subscribe( id='${id}', parentId='${parentId}' )` );

    const theId =  globalStreamNameManager.getName( id );

    const event:Sample = {
        type: 'start',
        time: eventTime(),
        id:theId,
        parentId:parentId,
        name:theId,
        createdByValue: true,
        isIntermediate:false
    };
    window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));

    return {
        next: (v:T) => {
            subscriber.next(v);

            const event:Sample = {
                type: 'value',
                time: eventTime(),
                id:theId,
                parentId:parentId,
                name:theId,
                value: v
            };
            console.debug( `next( id='${id}', parentId='${parentId}' )` );

            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
        },
        error: (err:T) => {
            subscriber.error(err);

            const event:Sample = {
                type: 'error',
                time: eventTime(),
                id:theId,
                parentId:parentId,
                name:theId,
                err:err
            };
            console.error( `next( id='${id}', parentId='${parentId}' )` );

            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
        },
        complete: () => {
            subscriber.complete();

            const event:Sample = {
                type: 'complete',
                time: eventTime(),
                id:theId,
                parentId:parentId,
                name:theId
            };

            console.debug( `complete( id='${id}', parentId='${parentId}' )` );

            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
        }
    }
};

