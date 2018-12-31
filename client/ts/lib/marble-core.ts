import { Observable, interval } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SamplerLogger } from './marble-handler';

 import { RXMarbleDiagramElement} from  './marble-element';

export interface Example {
    exec:( ( p?:(() => void)) => () => void );
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
    private unsubscribe:() => void

    get example() {
        return this._example;
    }

    constructor( private marbles:RxMarbles, private _example:ExampleCode, private done:()=>void) {
        if( !_example ) throw new Error( "example in null!");

        marbles.isPaused = this.isPaused = !_example.autoPlay

    }

    get isStopped() {
        return !this.unsubscribe;        
    }

    start() {
        this.marbles.isPaused = this.isPaused = false;
        this.unsubscribe = this._example.exec( this.done );
        return this;        
    }
    /**
     * 
     * @param unsubscribe 
     */
    stop( ) {
        if( !this.isStopped ) {

            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = undefined;
            }
            this.marbles.isPaused = this.isPaused = true;    
            console.log( "stop", this._example.name );
        }
        return this;
    }

    pause() {
        this.marbles.isPaused = this.isPaused = true;
        return this;
    }

    resume() {
        if (this.isStopped) return this.start();

        this.marbles.isPaused = this.isPaused = false;
        return this;
    }

}

export type Diagram = any;

export class RxMarbles {
    private _logger: SamplerLogger;
    private _diagram: Diagram;
    private stepInMs:number;
    
    isPaused = false;

    get logger() {
        return this._logger;
    }

    get diagram() {
        return this._diagram;
    }

    /**
     * 
     * @param div 
     * @param stepInMs 
     */
    constructor( diagram:RXMarbleDiagramElement ) {
        // Sample items
        this._logger = new SamplerLogger();
        // Draw marble diagram
        this._diagram   = diagram.render( this._logger.getSamples( () => !this.isPaused ));

        this.stepInMs = diagram.maxNbrOfSamples;
    }

    /**
     * 
     * @param example 
     */
    startExample( example:ExampleCode, done?:(()=>void) ):ExampleState {

        if( !example ) throw new Error( "example argument in null!");

        this._diagram.clear();

        const state = new ExampleState( this, example, () => {
            // Complete stops before sample is completed
            setTimeout( () => {
                if( done ) done();
                state.stop();
            }, this.stepInMs + 50);
        });
             
        return (example.autoPlay) ? state.start() : state;
    }

}

/**
 * 
 * @param element 
 * @param stepInMs 
 */
export function create( elementId:string ):RxMarbles {
    return new RxMarbles( document.getElementById(elementId) as RXMarbleDiagramElement );
}



