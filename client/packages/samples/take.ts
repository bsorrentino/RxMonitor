import { interval } from 'rxjs';
import { take,delay } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

const take$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = interval(1000).pipe( w$('interval(1s)') );
  const example = source.pipe(take(20), w$( 'take(20)') ).pipe( delay(4000), w$( 'delay(4s)') );

  return example.pipe( w$() ).subscribe( (val:any) => console.debug(val));
   
};

window.addEventListener('DOMContentLoaded', () => makeExample( take$ ) )
