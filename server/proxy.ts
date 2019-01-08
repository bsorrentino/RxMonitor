

import { take, map, combineAll } from 'rxjs/operators';
import { interval, Observable, Subscriber } from 'rxjs';


function _proxy_subscriber<T extends Object>( tag:string, input:T ):T {
    
    return  new Proxy( input, { 
        get: (target: T, name: PropertyKey, receiver: any) => {

            if( name in target ) {
                switch( name ) {
                    case 'next':
                    case 'error':
                        return ( v:any ) => {
                            console.log( tag, name, v );
                            (<any>target)[name]( v );
                        }
                    case 'complete':
                        return () => {
                            console.log( tag, name);
                            (<any>target)[name]();
                        }
                    case 'remove':
                        return ( v:any ) => {
                            console.log( tag, name );
                            (<any>target)[name]( v );
                        }
                    default:
                        return (<any>target)[name];
                }
                
            }
        }
    });
}

function _proxy_subscribe<T extends Object>( tag:string, input:T ):T {

    return  new Proxy( input, { 
        apply: (target: T, thisArg: any, argArray?: any) => {
            
            if( argArray && argArray.length == 1 && typeof(argArray[0]) == "object")  {
                let args = [ _proxy_subscriber(tag, argArray[0]) ];
        
                return  (<any>target).apply( thisArg, args );
            }
            

            return (<any>target).apply( thisArg, argArray );
        }
    })
}

function _p<T extends Object>( tag:string, input:T ):T {

    return  new Proxy( input, { 
        get: (target: T, name: PropertyKey, receiver: any) => {

            if( name in target ) {
                let result =  (<any>target)[name];

                if( name === "subscribe" ) {
                    return _proxy_subscribe( tag , result);
                }
                
                return result;
            }
        },
        apply: (target: T, thisArg: any, argArray?: any) => {

            let result =  (<any>target).apply( thisArg, argArray);

            return _p( tag, result);
        }
    })
}

_p("interval", interval( 1000 ))
    .pipe( _p( "map", map( e => e * 2)))
    .pipe( _p( "take", take(100)) )
    .subscribe( t => console.log(t) );