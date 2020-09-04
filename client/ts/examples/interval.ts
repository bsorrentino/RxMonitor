import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '../sdk/marble-rxjs';

const interval$ = () => {
  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const example = interval(1000).pipe( w$('interval(1s)'), take(60) );

  return example.pipe( w$() ).subscribe( (val:any) => console.debug(val));
   
};

window.addEventListener('DOMContentLoaded', () => makeExample( interval$ ) )
