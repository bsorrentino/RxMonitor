
import { combineLatest, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';



let combineLatest$ = () => {

let watchChild = <T>( id:string ) => watch<T>(id, 'combineLatest');


  //timerOne emits first value at 1s, then once every 4s
const timerOne = timer(1000, 4000).pipe( watchChild('timerOne') );
//timerTwo emits first value at 2s, then once every 4s
const timerTwo = timer(2000, 4000).pipe( watchChild('timerTwo') );
//timerThree emits first value at 3s, then once every 4s
const timerThree = timer(3000, 4000).pipe( take(2), watchChild('timerThree'));

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


/**
 * 
 */
window.addEventListener('load',  () => {   

    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => combineLatest$() );
      currentExample.start();
    })
});