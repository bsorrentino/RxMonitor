
import {interval, from, of, timer, combineLatest } from 'rxjs';
import { 
    concatMap, delay, tap, take, combineAll, map
} from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';
import { watch } from '../sdk/marble-rxjs';

var currentExample:rxmarbles.ExampleState;

let combineLatest$ = () => {
    //timerOne emits first value at 1s, then once every 4s
const timerOne = timer(1000, 4000).pipe( watch('timerOne', 'combineLatest'));
//timerTwo emits first value at 2s, then once every 4s
const timerTwo = timer(2000, 4000).pipe( watch('timerTwo', 'combineLatest'));
//timerThree emits first value at 3s, then once every 4s
const timerThree = timer(3000, 4000).pipe( take(2), watch('timerThree', 'combineLatest'));

//when one timer emits, emit the latest values from each timer as an array
const combined = combineLatest(timerOne, timerTwo, timerThree).pipe( take(8), watch('combineLatest'));

const subscribe = combined.subscribe(
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

const subscribe = combined.subscribe(val => console.log(val));

}

let sample1$ = () => {

    //of( 'A', 'B', 'C', 'D', 'E', 'F' )
    interval( 1000 ).pipe(take(20), watch( 'interval()' , '$result') )
    .pipe( concatMap( e =>  of(e).pipe( delay(1000) , watch( 'delay()' , '$result') ) ) )
    .pipe( watch( '$result') )
    .subscribe( 
        val => console.log(val), 
        err => {},
        () => {}
        )
   
};

/**
 * 
 */
window.addEventListener('load',  () => { 
  
    let marbles = rxmarbles.create( 'diagram1' );

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () =>  {
            combineLatest$()  
            return () => {}
        }

    };
 
    currentExample = marbles.startExample( shapes$ );
    
});