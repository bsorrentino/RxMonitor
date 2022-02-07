import { timer, interval } from 'rxjs';
import { window as windowOp, scan, mergeAll } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const window$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id )  

  const source = timer(0, 1000)
  const example = source.pipe( windowOp(interval(3000)) )
  const count = example
              .pipe( scan((acc, _) => acc + 1, 0), w$('window(3s)') ) 
              .pipe( w$() );

  count.subscribe( val => console.log(`Window ${val}:`));
  return example.pipe(mergeAll(), w$('interval(1s)') ).subscribe(console.log);
};

window.addEventListener('DOMContentLoaded', () => makeExample( window$ ) )
