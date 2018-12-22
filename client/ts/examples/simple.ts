
import {interval, from, of } from 'rxjs';
import { concatMap, delay, tap } from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';
import { tapx } from '../lib/marble-rxjs';

var currentExample:rxmarbles.ExampleState;

window.addEventListener('load',  () => { 
    let marbles = rxmarbles.create();

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () => {
            var i = 0;

            of( 'A', 'B', 'C', 'D', 'E', 'F', 'G' )
            //interval( 1000 )
            .pipe( tapx( 'interval(1000) ' , '$result') )
            .pipe( concatMap( e =>  of(e).pipe( delay(1000) , tapx( 'delay(1000) '+(++i) , '$result') ) ) )
            .pipe( tapx( '$result') )
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