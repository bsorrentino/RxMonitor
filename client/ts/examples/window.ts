import { timer, interval, of } from 'rxjs';
import { window, scan, mergeAll } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';

let window$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = timer(0, 1000).pipe( w$('timer(0,1s)') );
  const example = source.pipe(window(interval(3000).pipe( w$( 'window(3s)') ) ) );
  const count = example
              .pipe( scan((acc, _) => acc + 1, 0), w$('scan()') ) 
              .pipe( w$() )            
  ;

  return count.subscribe( (val:any) => console.log(val));
   
};

addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => window$() );
      currentExample.start();
    })
});