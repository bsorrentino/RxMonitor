import { timer, interval, of } from 'rxjs';
import { window, scan, mergeAll } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';


let window$ = () => {
   
    const source = timer(0, 1000).pipe( watch( 'timer(0,1s)' , '$result') );
    const example = source.pipe(window(interval(3000).pipe( watch( 'window(3s)', '$result') ) ) );
    const count = example
                .pipe( scan((acc, curr) => acc + 1, 0), watch( 'scan()', '$result') ) 
                .pipe( watch( '$result') )            
    ;

    return count.subscribe( (val:any) => console.log(val));
   
};

/**
 * 
 */
addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => window$() );
      currentExample.start();
    })
});