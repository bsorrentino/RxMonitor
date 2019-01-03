import { Subscription } from 'rxjs';

import { RXMarbleDiagramElement} from  './marble-element';

export type Example = ( p?:(() => void)) => Subscription;

// Time of one step

export class ExampleState {
    
    private subscription:Subscription;

    get example() {
        return this._example;
    }

    constructor( private diagram:RXMarbleDiagramElement, private _example:Example, private done:()=>void) {
    }

    get isStopped() {
        return !this.subscription || this.subscription.closed;        
    }

    start() {

        const t = this.diagram.tickTime + 50;

        this.diagram.pause = false;
        this.subscription = this._example( this.done );
        this.subscription.add( () => setTimeout( () => { if( this.done ) this.done(); }, t ));
        return this;        
    }

    stop( ) {
        if( !this.isStopped ) {
            this.subscription.unsubscribe();
            this.diagram.pause = true;    
        }
        return this;
    }

    pause() {
        this.diagram.pause = true;
        return this;
    }

    resume() {
        this.diagram.pause = false;
        return this;
    }

}

/**
 * 
 * @param elementId 
 * @param example 
 * @param done 
 */
export function startExample( elementId:string, example:Example, done?:(()=>void) ):ExampleState {

    if( !example ) throw new Error( "example argument in null!");

    let diagram = document.getElementById(elementId) as RXMarbleDiagramElement

    if( !diagram ) throw new Error( "element ${elementId} not found!");
    
    // Draw marble diagram
    diagram.start();

    return new ExampleState( diagram, example, done );
}



