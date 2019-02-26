
import { interval } from 'rxjs';
import { combineAll, map, take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';

let combineAll$ = () => {

//emit every 1s, take 2
const source = interval(1000).pipe(take(2));
//map each emitted value from source to interval observable that takes 5 values
const example = source.pipe( watch( 'source' , 'combineAll'),
  map(val => interval(1000).pipe(map(i => `${i}`), take(5), watch( 'example' , 'source')))
  
);
/*
  2 values from source will map to 2 (inner) interval observables that emit every 1s
  combineAll uses combineLatest strategy, emitting the last value from each
  whenever either observable emits a value
*/
const combined = example.pipe(combineAll(), watch( 'combineAll' ));

return combined.subscribe(val => console.log(val));

}


/**
 * 
 */
window.addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => combineAll$() );
      currentExample.start();
    })
});