import { interval, of } from 'rxjs';
import { concatMap, delay, take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const delay$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );

  let source = 
      interval( 1000 ).pipe(take(5), w$( 'interval(1s)' ) )
      .pipe( concatMap( e =>  of(e).pipe( delay(1000) , w$( 'delay(1s)') ) ) )
      .pipe( w$() )
      
  return source.subscribe( console.log ;
   
};

window.addEventListener('DOMContentLoaded', () => makeExample( delay$ ) )
