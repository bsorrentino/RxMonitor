import { forkJoin, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { startExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

function generateRandomNumber(min:number , max:number) {
   const random_number = Math.random() * (max-min) + min;
   return Math.floor(random_number);
}

let forkJoin$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  const myPromise = (val:any) =>
    from( new Promise(resolve => {
  
      let t = generateRandomNumber( 5000, 10000);
      setTimeout(() => resolve(`${val} `), t )

    })).pipe( w$("promise"))
    
  const source = of([1, 2, 3, 4, 5, 6, 7, 8]);

  const example = source.pipe( mergeMap(q => forkJoin(...q.map(myPromise))), w$() );

  return example.subscribe(val => console.log(val));

}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('start')
  btn.onclick = () => startExample( 'diagram1',  () => forkJoin$() ).start()
});
