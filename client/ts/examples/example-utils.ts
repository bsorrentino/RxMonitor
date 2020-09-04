/// <reference path="../lib/marble-diagram-element.d.ts" />

import { Subscription } from 'rxjs';

export type Example = ( p?:(() => void)) => Subscription;

// Time of one step

class ExampleState {
    
    private subscription:Subscription;

    get example() {
        return this._example;
    }

    constructor( private diagram:HTMLElement, private _example:Example, private done:()=>void) {
    }

    get isStopped() {
        return !this.subscription || this.subscription.closed;        
    }

    start() {
        const tickTime = 0
        this.diagram.setAttribute( 'pause', 'false' );
        this.subscription = this._example( this.done );
        this.subscription.add( () => setTimeout( () => { if( this.done ) this.done(); }, tickTime ));
        return this;        
    }

    stop( ) {
        if( !this.isStopped ) {
            this.subscription.unsubscribe();
            this.diagram.setAttribute( 'pause', 'true' );
        }
        return this;
    }

    pause() {
        this.diagram.setAttribute( 'pause', 'true' );
        return this;
    }

    resume() {
        this.diagram.setAttribute( 'pause', 'false' );
        return this;
    }

}

/**
 * 
 * @param elementId 
 * @param example 
 * @param done 
 */
export function makeExample( example:Example, done?:(()=>void) ):void {
  
    if( !example ) throw new Error( "example argument in null!");

    let diagram = document.getElementById('diagram1')

    if( !diagram ) throw new Error( "element ${elementId} not found!");
    
    const pause = document.getElementById('pause')
    if( pause ) {
        pause.onchange = (ev:any) =>  diagram.setAttribute( 'pause', String(ev.srcElement.checked) )  
    }

    const btn = document.getElementById('start')
    console.assert( btn, 'start button is not present in DOM')
    let state = new ExampleState( diagram, example, done )

    btn.onclick = () => {
        diagram.setAttribute( 'start', 'true');
        state.start() 
    }
}
