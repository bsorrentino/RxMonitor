
import { startExample, watch } from '../sdk/marble-rxjs';

import { interval } from 'rxjs';
import { exhaustMap, tap, take } from 'rxjs/operators';

let exhaustMap$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  const firstInterval = interval(1000).pipe(w$('1stInterval')).pipe(take(10) )
  const secondInterval = interval(1000).pipe(w$('2ndInterval')).pipe(take(2) )
  
    const exhaustSub = firstInterval
    .pipe(
      exhaustMap(f => {
        console.log(`Emission Corrected of first interval: ${f}`);
        return secondInterval;
      })
   )

   return exhaustSub
            .pipe( w$() )  
            .subscribe( val => console.log(val));

}

window.addEventListener('load',  () =>  
    document.addEventListener( "click", () => 
      startExample( 'diagram1',  () => exhaustMap$() ).start())
);