
import {interval, from, of } from 'rxjs';
import { concatMap, delay, tap } from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';
import { tapx } from '../lib/marble-rxjs';

var currentExample:rxmarbles.ExampleState;

let sample1$ = () => {
    var i = 0;

    of( 'A', 'B', 'C', 'D', 'E', 'F' )
    //interval( 1000 )
    //.pipe( tapx( 'interval(1000) ' , '$result') )
    .pipe( concatMap( e =>  of(e).pipe( /*delay(1000) ,*/ tapx( 'delay(1000) '+(++i) , '$result') ) ) )
    .pipe( tapx( '$result') )
    .subscribe( 
        val => console.log(val), 
        err => {},
        () => {}
        )
   
};

/**
 * 
 */
window.addEventListener('load',  () => { 
    let marbles = rxmarbles.create();

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () =>  {
            sample1$()  
            return () => {}
        }

    };
 

    currentExample = marbles.startExample( shapes$ );

});