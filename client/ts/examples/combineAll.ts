
import { interval } from 'rxjs';
import { combineAll, map, take } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';

let combineAll$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = interval(1000).pipe(take(2));

  const example = source.pipe( w$('source'),
                    map(val => interval(1000).pipe( take(5), watch( 'source', 'example'))) );

const combined = example.pipe(combineAll(), w$());

return combined.subscribe(val => console.log(val));

}

window.addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => combineAll$() );
      currentExample.start();
    })
});