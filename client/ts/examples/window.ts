import { timer, interval } from 'rxjs';
import { window as windowOp, scan } from 'rxjs/operators';
import { startExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

let window$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = timer(0, 1000).pipe( w$('timer(0,1s)') );
  const example = source.pipe(windowOp(interval(3000).pipe( w$( 'window(3s)') ) ) );
  const count = example
              .pipe( scan((acc, _) => acc + 1, 0), w$('scan()') ) 
              .pipe( w$() );

  return count.subscribe( (val:any) => console.log(val));
   
};

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('start')
  btn.onclick = () => startExample( 'diagram1',  () => window$() ).start()
});
