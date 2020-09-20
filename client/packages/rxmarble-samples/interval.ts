import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk';

const interval$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const example = interval(1000).pipe( w$('interval(1s)'), take(10) );

  return example.pipe( w$() ).subscribe( console.debug );
   
};

window.addEventListener('DOMContentLoaded', () => makeExample( interval$ ) )
