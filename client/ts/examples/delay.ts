import { interval, of } from 'rxjs';
import { concatMap, delay, take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';


let delay$ = () => {
   
    let source = 
      interval( 1000 ).pipe(take(20), watch( 'interval()' , '$result') )
      .pipe( concatMap( e =>  of(e).pipe( delay(1000) , watch( 'delay()' , '$result') ) ) )
      .pipe( watch( '$result') )
    
    
    return source.subscribe( val => console.log(val));
   
};

/**
 * 
 */
window.addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => delay$() );
      currentExample.start();
    })
});