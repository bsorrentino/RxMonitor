import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { startExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

let interval$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const example = interval(1000).pipe( w$('interval(1s)'), take(60) );

  return example.pipe( w$() ).subscribe( (val:any) => console.debug(val));
   
};

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('start')
  btn.onclick = () => startExample( 'diagram1',  () => interval$() ).start()
});
