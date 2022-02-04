/** Simple Quick & Dirty marble visualizer, POJS no framework */

import p5 from 'p5'

import { DEFAULT_BACKGROUND, DEFAULT_FPS, Watch } from './p5/common'
import { diagram as createDiagram, Diagram  } from './p5/diagram'
import { Sample, SampleInfo } from './marble-types';

const noneFilledShapes  = ['□', '△', '○', '▷', '☆'];
const filledShapes      = ['■', '▲', '●', '▶', '★'];


function isStart( info:SampleInfo  ) {
    return info && info.type === 'start';
}

const USE_SHADOW_DOM    = true;
const PAUSE_ATTR        = 'pause';
const START_ATTR        = 'start';

function isTrue( v?:string ) {
    return (v) ? v=='true' : false
}

// @see
// https://dev.to/aspittel/building-web-components-with-vanilla-javascript--jho
// https://www.codementor.io/ayushgupta/vanilla-js-web-components-chguq8goz
export class RXMarbleDiagramElement extends HTMLElement {

    private container:HTMLDivElement
    private sketch:p5;
    private nbrOfSamplesReceived = 0;

    static get observedAttributes() { return [PAUSE_ATTR, START_ATTR]; }

    private diagram:Diagram = null 

    /**
     * 
     */
    constructor() {
        super();
    }

    /**
     * 
     */
    connectedCallback () {

        const shadowRoot = (USE_SHADOW_DOM) ? 
            this.attachShadow({mode: 'open'}) :
            document.body;
        
        if( USE_SHADOW_DOM ) {
            shadowRoot.appendChild( this.getTemplate().content.cloneNode(true) );
        }

        this.container = document.createElement('div');

        this.sketch = new p5( (k$:p5) => this.sketchSetup(k$), this.container )

        shadowRoot.appendChild( this.container );

    }

    /**
     * 
     * @param attribute 
     * @param oldval 
     * @param newval 
     */
    attributeChangedCallback(attribute:string, oldval:any, newval:any) {

        console.debug( "update ${attribute}", oldval, newval );

        switch( attribute ) {
            case START_ATTR: 
                if( isTrue(newval) ) {
                    this._start()
                }
            break;
            case PAUSE_ATTR: 
                if( isTrue(newval) ) {
                    this.sketch?.noLoop()
                }
                else {
                    this.sketch?.loop()
                }
            break;
        }
    }


    private getTemplate() {

        const template = document.createElement('template');
        template.innerHTML = 
        `
        <style>
        </style>

        <slot></slot>
        `;
        
        return template;
     
    }

    private processSample( s:Sample, k$:p5 ) {
        console.assert( this.diagram!==undefined, 'diagram is not started yet!')

        this.nbrOfSamplesReceived++;

        let op = this.diagram.getOperator( s.id )

        if ( !op   ) {
            if( isStart(s) )  this.diagram.addOperator( k$, s.id )
            return 
        }
        
        this.diagram.processEvent( s, op )

    }
    
    private sketchSetup( k$:p5 ) {
  
        k$.setup = () => { 
            const canvas = k$.createCanvas(1024,768);
            canvas.style( 'background-color', '#222222')
            k$.frameRate(DEFAULT_FPS);
            k$.noLoop()  
            
            canvas.style( 'visibility', 'visible' )

            const eventHandler = (event:any) =>  this.processSample( event.detail, k$ )
            window.addEventListener( 'rxmarbles.event', eventHandler)

            const pauseHandler = (event:any) => this.diagram?.pause()
            this.addEventListener( 'rxmarbles.pause', pauseHandler)

            const resumeHandler = (event:any) => this.diagram?.resume()
            this.addEventListener( 'rxmarbles.resume', resumeHandler)
            
            this.addEventListener( 'rxmarbles.stop', (_) => {

                window.removeEventListener( 'rxmarbles.event', eventHandler)
                window.removeEventListener( 'rxmarbles.pause', pauseHandler)
                window.removeEventListener( 'rxmarbles.resume', resumeHandler)

                this.diagram?.stop()
                

            })

        }
      
        k$.draw = () => {
          
          k$.background(DEFAULT_BACKGROUND);
                      
          this.diagram?.draw( k$ )
        };

    }

    /**
     * 
     */
    private _start() {   

        this.diagram = createDiagram( { y:25 }, this.sketch )
 
        this.sketch.loop()
    }
}

try {

    customElements.define('rxmarble-diagram', RXMarbleDiagramElement);

} catch (err) {
    console.error( err );
}
    


