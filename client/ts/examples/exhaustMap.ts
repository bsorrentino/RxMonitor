
import { startExample, watch } from '../sdk/marble-rxjs';
import { interval, merge, of } from 'rxjs';
import { delay, take, exhaustMap, map } from 'rxjs/operators';

let exhaustMap$ = () => {

  const sourceInterval = interval(1000);
  const delayedInterval = sourceInterval.pipe(delay(10), map( v => v*2 ), take(4));
  
  const exhaustSub = merge(
    delayedInterval.pipe( watch('delayedInterval', '$result') ),
    of(true, false, true, false).pipe( watch('of()', '$result') )
    )
    .pipe( watch('merge', '$result') )
    .pipe(exhaustMap(_ => sourceInterval.pipe(take(6))), watch( 'exhaustMap', '$result'))

    return exhaustSub
            .pipe( watch( '$result') )  
            .subscribe( val => console.log(val));

}

window.addEventListener('load',  () =>  
    document.addEventListener( "click", () => 
      startExample( 'diagram1',  () => exhaustMap$() ).start())
);