import { forkJoin, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { startExample, watch } from '../sdk/marble-rxjs';


function generateRandomNumber(min:number , max:number) {
   const random_number = Math.random() * (max-min) + min;
   return Math.floor(random_number);
}

let forkJoin$ = () => {

  let watchResult = <T>() => watch<T>('forkJoin');
  let watchStream = <T>( id:string ) => watch<T>(id, 'forkJoin');

  const myPromise = (val:any) =>
    from( 
    new Promise(resolve => {
  
      let t = generateRandomNumber( 5000, 10000);
      setTimeout(() => resolve(`res: ${val}`), t )

    })).pipe( watchStream("promise"))


    
const source = of([1, 2, 3, 4, 5, 6, 7, 8]).pipe( watchStream( 'of' ));

//emit array of all 5 results

const example = source.pipe( mergeMap(q => forkJoin(...q.map(myPromise))), watchResult() );

return example.subscribe(val => console.log(val));

}


/**
 * 
 */
window.addEventListener('load',  () => { 
  
    document.addEventListener( "click", ()=> {
      let currentExample = startExample( 'diagram1',  () => forkJoin$() );
      currentExample.start();
    })
});