import {  
    Observable, 
    PartialObserver, 
    MonoTypeOperatorFunction, 
    Observer 
} from 'rxjs';
import { 
    Sample, 
    SampleItemType
 } from './marble-handler';


export function tapx<T>( id:string, parentId?:string ):MonoTypeOperatorFunction<T> {

    return (source:Observable<T>) => new Observable<T>( observer =>  {

        return source.subscribe(_observe( observer, id, parentId ) );
    })
}

let _time = () => (performance) ? performance.now() : Date.now() ;



function _observe<T>( observer:Observer<T> , id:string, parentId?:string ):PartialObserver<T> 
{
    const event:Sample = {
        type: SampleItemType.Start,
        time: _time(),
        id:id,
        parentId:parentId,
        name:id,
        createdByValue: true,
        isIntermediate:false
    };
    window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));

    return {
        next: (v:any) => {
            const event:Sample = {
                type: SampleItemType.Value,
                time: _time(),
                id:id,
                parentId:parentId,
                name:id,
                value: v
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.next(v);
        },
        error: (err:any) => {
            console.log( id, parentId, name, err );
            const event:Sample = {
                type: SampleItemType.Error,
                time: _time(),
                id:id,
                parentId:parentId,
                name:id,
                err:err
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.error(err);
        },
        complete: () => {
            const event:Sample = {
                type: SampleItemType.Complete,
                time: _time(),
                id:id,
                parentId:parentId,
                name:id
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.complete();
        }
    }
};


/// JS PROXY 

/*
function _proxy_subscriber<T extends Object>( id:string, parentId:string, input:T ):T {
    
    return  new Proxy( input, { 
        get: (target: T, name: PropertyKey, receiver: any) => {

            if( name in target ) {
                switch( name ) {
                    case 'next': 
                        return ( v:any ) => { 
                            console.log( id, parentId, name, v );
                            const event:Sample = {
                                type: SampleItemType.Value,
                                time: Date.now(),
                                id:id,
                                parentId:parentId,
                                name:id,
                                value: v
                            };
                            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
                            return (<any>target)[name]( v );
                        }
                    case 'error':
                        return ( err:any ) =>  { 

                            console.log( id, parentId, name, err );
                            const event:Sample = {
                                type: SampleItemType.Error,
                                time: Date.now(),
                                id:id,
                                parentId:parentId,
                                name:id,
                                err:err
                            };
                            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
                            
                            return (<any>target)[name]( err );
                        }
                    case 'complete':
                        return ( v:any ) => { 
                            console.log( id, parentId, name, v );

                            const event:Sample = {
                                type: SampleItemType.Complete,
                                time: Date.now(),
                                id:id,
                                parentId:parentId,
                                name:id
                            };
                            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
                            return (<any>target)[name]( v );
                        }
                    case 'remove':
                        return ( v:any ) => { 
                            console.log( id, parentId, name, v );

                            const event:Sample = {
                                type: SampleItemType.Stop,
                                time: Date.now(),
                                id:id,
                                parentId:parentId,
                                name:id
                            };
                            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
                            return (<any>target)[name]( v );
                        }
                    case 'add':
                        return ( v:any ) => { 
                            console.log( id, parentId, name, v );

                            const event:Sample = {
                                type: SampleItemType.Start,
                                time: Date.now(),
                                id:id,
                                parentId:parentId,
                                name:id,
                                createdByValue: true,
                                isIntermediate:false
                            };
                            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
                            return (<any>target)[name];
                        }
                    default: 
                        {
                            let v = (<any>target)[name];
                            console.log( id, parentId, '==>' + String(name), v );
                            return v;
                        }
                }
                
            }
        }
    });
}

function _proxy_subscribe<T extends Object>( id:string, parentId:string, input:T ):T {


    return  new Proxy( input, { 
        apply: (target: T, thisArg: any, argArray?: any) => {
            
            if( argArray && argArray.length == 1 && typeof(argArray[0]) == "object")  {
                let args = [ _proxy_subscriber(id, parentId, argArray[0]) ];
        
                return  (<any>target).apply( thisArg, args );
            }
            
            return (<any>target).apply( thisArg, argArray );
        }
    })
}

export function _p<T extends Object>( id:string, parentId:string, input:T ):T {

    return  new Proxy( input, { 
        get: (target: T, name: PropertyKey, receiver: any) => {

            if( name in target ) {
                let result =  (<any>target)[name];

                if( name === "subscribe" ) {
                    return _proxy_subscribe( id, parentId, result);
                }
                
                return result;
            }
        },
        apply: (target: T, thisArg: any, argArray?: any) => {

            let result =  (<any>target).apply( thisArg, argArray);

            return _p( id, parentId, result);
        }
    })
}

*/