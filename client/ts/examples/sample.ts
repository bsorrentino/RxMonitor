
import {interval, from, of, timer, combineLatest,forkJoin,  } from 'rxjs';
import { 
    concatMap, delay, tap, take, combineAll, map, mergeMap
} from 'rxjs/operators';

import { ExampleState, startExample} from '../lib/marble-core';
import { watch } from '../sdk/marble-rxjs';

function generateRandomNumber(min:number , max:number) {
  let random_number = Math.random() * (max-min) + min;
   return Math.floor(random_number);
}

let combineLatest$ = () => {
    //timerOne emits first value at 1s, then once every 4s
const timerOne = timer(1000, 4000).pipe( watch('timerOne', 'combineLatest'));
//timerTwo emits first value at 2s, then once every 4s
const timerTwo = timer(2000, 4000).pipe( watch('timerTwo', 'combineLatest'));
//timerThree emits first value at 3s, then once every 4s
const timerThree = timer(3000, 4000).pipe( take(2), watch('timerThree', 'combineLatest'));

//when one timer emits, emit the latest values from each timer as an array
const combined = combineLatest(timerOne, timerTwo, timerThree).pipe( take(10), watch('combineLatest'));

return combined.subscribe(
  ([timerValOne, timerValTwo, timerValThree]) => {
    /*
      Example:
    timerOne first tick: 'Timer One Latest: 1, Timer Two Latest:0, Timer Three Latest: 0
    timerTwo first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 0
    timerThree first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 1
  */
    console.log(
      `Timer One Latest: ${timerValOne},
     Timer Two Latest: ${timerValTwo},
     Timer Three Latest: ${timerValThree}`
    );
  }
);

}

let forkJoin$ = () => {

  const myPromise = (val:any) =>
    from( 
    new Promise(resolve => {
  
      let t = generateRandomNumber( 5000, 10000);
      setTimeout(() => resolve(`res: ${val}`), t )

    })).pipe( watch("promise", 'forkJoin'))


    
const source = of([1, 2, 3, 4, 5, 6, 7, 8]).pipe( watch( 'of', 'forkJoin'));

//emit array of all 5 results

const example = source.pipe( mergeMap(q => forkJoin(...q.map(myPromise))), watch('forkJoin') );

return example.subscribe(val => console.log(val));

}


let combineAll$ = () => {

//emit every 1s, take 2
const source = interval(1000).pipe(take(2));
//map each emitted value from source to interval observable that takes 5 values
const example = source.pipe(
  watch( 'source' , 'combineAll'),
  map(val => interval(1000).pipe(map(i => `${val},${i}`), take(5), watch( 'example' , 'source')))
  
);
/*
  2 values from source will map to 2 (inner) interval observables that emit every 1s
  combineAll uses combineLatest strategy, emitting the last value from each
  whenever either observable emits a value
*/
const combined = example.pipe(combineAll(), watch( 'combineAll' ));

return combined.subscribe(val => console.log(val));

}

let deplay$ = () => {
   
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
  
    let shapes$ = [
      () => deplay$(),
      () => combineLatest$(),  
      () => forkJoin$(),
      () => combineAll$()
    ];

    
    

    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  shapes$[1] );
      currentExample.start();
    })
});