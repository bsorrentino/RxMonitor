import { interval, of } from 'rxjs';
import { concatMap, delay, take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';

let delay$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  let source = 
      interval( 1000 ).pipe(take(10), w$( 'interval()' ) )
      .pipe( concatMap( e =>  of(e).pipe( delay(1000) , w$( 'delay()') ) ) )
      .pipe( w$() )
      
  return source.subscribe( val => console.log(val));
   
};

window.addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => delay$() );
      currentExample.start();
    })
});