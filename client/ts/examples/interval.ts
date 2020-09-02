import { interval } from 'rxjs';
import { startExample, watch } from '../sdk/marble-rxjs';
import { take } from 'rxjs/operators';

let interval$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const example = interval(1000).pipe( w$('interval(1s)'), take(60) );

  return example.pipe( w$() ).subscribe( (val:any) => console.debug(val));
   
};

addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => interval$() );
      currentExample.start();
    })
});