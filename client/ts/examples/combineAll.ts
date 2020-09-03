
import { interval } from 'rxjs';
import { combineAll, map, take } from 'rxjs/operators';
import { startExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

let combineAll$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = interval(1000).pipe(take(2));

  const example = source.pipe( w$('source'),
                    map(val => interval(1000).pipe( take(5), watch( 'source', 'example'))) );

const combined = example.pipe(combineAll(), w$());

return combined.subscribe(val => console.log(val));

}


window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('start')
  btn.onclick = () => startExample( 'diagram1',  () => combineAll$() ).start()
});
