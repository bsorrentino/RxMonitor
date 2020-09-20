
import { interval } from 'rxjs';
import { combineAll, map, take } from 'rxjs/operators';
import { makeExample } from './example-utils';
import { watch } from '@bsorrentino/rxmarble-sdk'

const combineAll$ = () => {

  const w$ = <T>( id?:string ) => watch<T>( '$result', id );   

  const source = interval(1000).pipe(take(2));

  const example = source.pipe( w$('source'),
                    map(val => interval(1000).pipe( take(5), watch( 'source', 'example'))) );

const combined = example.pipe(combineAll(), w$());

return combined.subscribe(val => console.log(val));

}

window.addEventListener('DOMContentLoaded', () => makeExample( combineAll$ ) )
