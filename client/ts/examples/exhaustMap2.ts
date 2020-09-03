
import { interval } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import { startExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

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

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('start')
  btn.onclick = () => startExample( 'diagram1',  () => exhaustMap$() ).start()
});
