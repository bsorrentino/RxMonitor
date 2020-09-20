
import { combineLatest, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const combineLatest$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const timerOne = timer(1000, 400).pipe( w$('timerOne') );
  const timerTwo = timer(2000, 200).pipe( w$('timerTwo') );
  const timerThree = timer(3000, 300).pipe( take(2), w$('timerThree'));

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

window.addEventListener('DOMContentLoaded', () => makeExample( combineLatest$ ) )
