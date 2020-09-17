/** Simple Quick & Dirty marble visualizer, POJS no framework */

import { Observable, Observer, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

//const noneFilledShapes  = ['□', '△', '○', '▷', '☆'];
//const filledShapes      = ['■', '▲', '●', '▶', '★'];

const URL_ATTR     = 'sse-url';

export class RXMarbleSSEElement extends HTMLElement {

    private subscription:Subscription;

    get url() {
        return this.getAttribute(URL_ATTR) || "events";
    }

    set url( v:string ) {
       this.setAttribute(URL_ATTR, v );
    }

    static get observedAttributes():Array<string> { return []; }

    constructor() {
        super();
    }

    connectedCallback () {

        const evtSource = Observable.create( (observer:Observer<any>) => {
            const evtSource  = new EventSource( this.url, { withCredentials: false } );
    
            evtSource.onmessage = e => observer.next( JSON.parse(e.data) );
    
            evtSource.onerror = (e:any) => observer.next( new Error(e.data) );
    
            return () => evtSource.close();
        });

        this.subscription = 
            evtSource
                .pipe( tap( 
                    (e:any) => console.log( "sse event", e ),
                    (e:any) => console.log( "sse error", e ) ))
                .subscribe(
                    (event:any) => window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } )) 
                );
    }

    disconnectedCallback() {

        if(this.subscription && !this.subscription.closed) {
            this.subscription.unsubscribe();
        } 

    }

    attributesChangedCallback(attribute:string, oldval:any, newval:any) {

        console.log( "update ${attribute}", oldval, newval );
    }

}

try {

    customElements.define('rxmarble-sse', RXMarbleSSEElement);

} catch (err) {
    console.error( err );
}
    


