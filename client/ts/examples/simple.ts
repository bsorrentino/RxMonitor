
import {interval, from, of } from 'rxjs';
import { delay, concatMap, tap } from 'rxjs/operators';

import * as rxmarbles from '../lib/marble-core';

var currentExample:rxmarbles.ExampleState;

window.addEventListener('load',  () => { 
    let marbles = rxmarbles.create();

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () => {

            marbles.logger.onStart( {   
                id:producerId, 
                name:name, 
                //parentId:parentProducerId, 
                createdByValue:true, 
                isIntermediate:false
            });

            of( 'A', 'B', 'C', 'D', 'E', 'F' )
            .pipe( delay(500), concatMap( e => of(e).pipe( delay(1000) )))
            .subscribe( val => {

                marbles.logger.onValue({   
                    id:producerId, 
                    name:name, 
                    //parentId:parentProducerId, 
                    value:val, 
                    });   

            }, err => {},
            () => marbles.logger.onComplete( { 
                id:producerId, 
                name:name, 
                //parentId:parentProducerId, 
                 } ));
            

            return () => {}
        }
        
    };
 

    currentExample = marbles.startExample( shapes$ );

});