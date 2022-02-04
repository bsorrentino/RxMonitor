
import { interval, merge, of } from 'rxjs';
import { delay, take, exhaustMap, map } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const exhaustMap$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  const sourceInterval = interval(1000);
  const delayedInterval = sourceInterval.pipe(delay(10), map( v => v*2 ), take(4))
                                        .pipe( w$('delay(10)') );
  
  const exhaustSub = merge( 
      delayedInterval, 
      of(true,false,true,true).pipe( w$('of()') )
    )
    .pipe( w$('merge') )
    .pipe( exhaustMap(_ => sourceInterval.pipe(w$('srcInterval(1s)')).pipe(take(5))) )

    return exhaustSub
            .pipe( w$() )  
            .subscribe( val => console.log(val));

}

window.addEventListener('DOMContentLoaded', () => makeExample( exhaustMap$ ) )
