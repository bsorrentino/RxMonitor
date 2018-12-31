import {  
    Observable, 
    MonoTypeOperatorFunction
} from 'rxjs';

import { observeAndNotify } from '../lib/marble-handler';


export function watch<T>( id:string, parentId?:string ):MonoTypeOperatorFunction<T> {

    return (source:Observable<T>) => new Observable<T>( observer =>  {

        return source.subscribe(observeAndNotify( observer, id, parentId ) );
    })
}


