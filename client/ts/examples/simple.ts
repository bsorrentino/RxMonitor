
import {interval, from, of } from 'rxjs';
import { concatMap, delay, tap } from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';
import { _p_observer } from '../lib/marble-rxjs';

var currentExample:rxmarbles.ExampleState;

window.addEventListener('load',  () => { 
    let marbles = rxmarbles.create();

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () => {
            var i = 0;

            //of( 'A', 'B', 'C', 'D', 'E', 'F' )
            interval( 1000 )
            .pipe(  _p_observer( 'interval(1000) ' , '$result') )
            .pipe(  concatMap( e =>  of(e).pipe( delay(1000) , _p_observer( 'delay(1000) '+(++i) , '$result') ) ) )
            .pipe( _p_observer( '$result') )
            .subscribe( val => {
                console.log(val);
            }, 
            err => {

            },
            () => {  

            })                 
                ;
            
            return () => {}
        }
        
    };
 

    currentExample = marbles.startExample( shapes$ );

});