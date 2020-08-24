import { interval } from 'rxjs';
import { take,delay } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';

let window$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = interval(1000).pipe( w$('interval(1s)') );
  const example = source.pipe(take(20), w$( 'take(20)') ).pipe( delay(5000), w$( 'delay(5s)') );

  return example.pipe( w$() ) .subscribe( (val:any) => console.log(val));
   
};

addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => window$() );
      currentExample.start();
    })
});