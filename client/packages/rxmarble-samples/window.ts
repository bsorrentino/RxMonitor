import { timer, interval } from 'rxjs';
import { window as windowOp, scan } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const window$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = timer(0, 1000).pipe( w$('timer(0,1s)') );
  const example = source.pipe(windowOp(interval(3000).pipe( w$( 'window(3s)') ) ) );
  const count = example
              .pipe( scan((acc, _) => acc + 1, 0), w$('scan()') ) 
              .pipe( w$() );

  return count.subscribe( (val:any) => console.log(val));
   
};

window.addEventListener('DOMContentLoaded', () => makeExample( window$ ) )
