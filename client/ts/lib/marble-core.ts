import { Observable, interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RXMarbleDiagramElement} from  './marble-element';

export interface Example {
    exec:( ( p?:(() => void)) => Subscription );
    name?:string;
    group?:string;
    autoPlay?:boolean;
    infoHtml?:string;
    onlyStop?:boolean;
}

export type ExampleCode = { code?:string } & Example;

// Time of one step

export class ExampleState {
    
    isPaused = false;
    private unsubscribe:Subscription;

    get example() {
        return this._example;
    }

    constructor( private diagram:RXMarbleDiagramElement, private _example:ExampleCode, private done:()=>void) {
        if( !_example ) throw new Error( "example in null!");

        diagram.pause = this.isPaused = !_example.autoPlay

    }

    get isStopped() {
        return !this.unsubscribe || this.unsubscribe.closed;        
    }

    start() {
        this.diagram.pause = this.isPaused = false;
        this.unsubscribe = this._example.exec( this.done );
        return this;        
    }
    /**
     * 
     * @param unsubscribe 
     */
    stop( ) {
        if( !this.isStopped ) {

            this.unsubscribe.unsubscribe();
            this.diagram.pause = this.isPaused = true;    
            console.log( "stop", this._example.name );
        }
        return this;
    }

    pause() {
        this.diagram.pause = this.isPaused = true;
        return this;
    }

    resume() {
        if (this.isStopped) return this.start();

        this.diagram.pause = this.isPaused = false;
        return this;
    }

}

export class RxMarbles {
    
    private stepInMs:number;

    get diagram() {
        return this._diagram;
    }

    /**
     * 
     * @param div 
     * @param stepInMs 
     */
    constructor( private _diagram:RXMarbleDiagramElement ) {

        this.stepInMs = _diagram.maxNbrOfSamples;
    }

    /**
     * 
     * @param example 
     */
    startExample( example:ExampleCode, done?:(()=>void) ):ExampleState {

        if( !example ) throw new Error( "example argument in null!");

        // Draw marble diagram
        this._diagram.start();

        const state = new ExampleState( this._diagram, example, () => {
            // Complete stops before sample is completed
            setTimeout( () => {
                if( done ) done();
                state.stop();
            }, this.stepInMs + 50);
        });
             
        return (example.autoPlay) ? state.start() : state;
    }

}

export function startExample( elementId:string, example:ExampleCode, done?:(()=>void) ):ExampleState {

    if( !example ) throw new Error( "example argument in null!");

    let diagram = document.getElementById(elementId) as RXMarbleDiagramElement

    if( !diagram ) throw new Error( "element ${elementId} not found!");
    
    // Draw marble diagram
    diagram.start();

    const state = new ExampleState( diagram, example, () => {
        // Complete stops before sample is completed
        setTimeout( () => {
            if( done ) done();
            state.stop();
        }, diagram.tickTime + 50);
    });
         
    return (example.autoPlay) ? state.start() : state;
}
/**
 * 
 * @param element 
 * @param stepInMs 
 */
export function create( elementId:string ):RxMarbles {
    return new RxMarbles( document.getElementById(elementId) as RXMarbleDiagramElement );
}



