
import { startExample, watch } from '../sdk/marble-rxjs';
import { interval, merge, of } from 'rxjs';
import { delay, take, exhaustMap, map } from 'rxjs/operators';

let exhaustMap$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  const sourceInterval = interval(1000);
  const delayedInterval = sourceInterval.pipe(delay(10), map( v => v*2 ), take(4));
  
  const exhaustSub = merge(
    delayedInterval.pipe( w$('delayedInterval') ),
    of(true, false, true, false).pipe( w$('of()') )
    )
    .pipe( w$('merge') )
    .pipe(exhaustMap(_ => sourceInterval.pipe(take(6))), w$( 'exhaustMap'))

    return exhaustSub
            .pipe( w$() )  
            .subscribe( val => console.log(val));

}

window.addEventListener('load',  () =>  
    document.addEventListener( "click", () => 
      startExample( 'diagram1',  () => exhaustMap$() ).start())
);