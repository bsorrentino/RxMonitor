
import { interval } from 'rxjs';
import { combineLatestAll, map, take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk'

const combineLatestAll$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   
  // emit every 1s, take 2
  const source$ = interval(1000).pipe( take(2), w$('source') );
  // map each emitted value from source to interval observable that takes 5 values
  const example$ = source$.pipe(
    map(val => interval(1000).pipe( map(i => `${val},${i}`), take(5), w$('map') ))  );
  /*
    2 values from source will map to 2 (inner) interval observables that emit every 1s
    combineAll uses combineLatest strategy, emitting the last value from each
    whenever either observable emits a value
  */
  return example$.pipe(combineLatestAll()).pipe( w$() )
  /*
    output:
    ["Result (0): 0", "Result (1): 0"]
    ["Result (0): 1", "Result (1): 0"]
    ["Result (0): 1", "Result (1): 1"]
    ["Result (0): 2", "Result (1): 1"]
    ["Result (0): 2", "Result (1): 2"]
    ["Result (0): 3", "Result (1): 2"]
    ["Result (0): 3", "Result (1): 3"]
    ["Result (0): 4", "Result (1): 3"]
    ["Result (0): 4", "Result (1): 4"]
  */
  .subscribe( console.log );
}

window.addEventListener('DOMContentLoaded', () => makeExample( combineLatestAll$ ) )
