
import {interval, from, of } from 'rxjs';
import { delay, concatMap, tap } from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';
import { onStart, onValue, onStop, onComplete } from '../lib/marble-handler';

var marbles:rxmarbles.RxMarbles;
var currentExample:rxmarbles.ExampleState;

window.addEventListener('load',  () => { 

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () => {

            onStart( {   
                id:producerId, 
                name:name, 
                //parentId:parentProducerId, 
                createdByValue:true, 
                isIntermediate:false
            });

            of( 'A', 'B', 'C', 'D', 'E', 'F' )
            .pipe( delay(500), concatMap( e => of(e).pipe( delay(1000) )))
            .subscribe( val => {

                onValue({   
                    id:producerId, 
                    name:name, 
                    //parentId:parentProducerId, 
                    value:val, 
                    });   

            }, err => {},
            () => onComplete( { 
                id:producerId, 
                name:name, 
                //parentId:parentProducerId, 
                 } ));
            

            return () => {}
        }
        
    };
 
    marbles = rxmarbles.create();

    currentExample = marbles.startExample( shapes$ );

});