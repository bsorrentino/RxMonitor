
import { combineLatest, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-p5-rxjs';

let combineLatest$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const timerOne = timer(1000, 4000).pipe( w$('timerOne') );
  const timerTwo = timer(2000, 4000).pipe( w$('timerTwo') );
  const timerThree = timer(3000, 4000).pipe( take(2), w$('timerThree'));

const combined = combineLatest(timerOne, timerTwo, timerThree).pipe( take(10), w$());

return combined.subscribe(
  ([timerValOne, timerValTwo, timerValThree]) => {
    console.log(
      `Timer One Latest: ${timerValOne},
     Timer Two Latest: ${timerValTwo},
     Timer Three Latest: ${timerValThree}`
    );
  }
);

}

window.addEventListener('load',  () => {   

    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => combineLatest$() );
      currentExample.start();
    })
});