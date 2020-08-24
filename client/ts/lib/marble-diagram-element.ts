/** Simple Quick & Dirty marble visualizer, POJS no framework */
import p5 from 'p5'
import { SampleItemType, Sample, SampleInfo } from './marble-types';

import { DEFAULT_BACKGROUND, DEFAULT_FPS, Watch } from './p5/common'
import { diagram as createDiagram, Diagram  } from './p5/diagram'

const noneFilledShapes  = ['□', '△', '○', '▷', '☆'];
const filledShapes      = ['■', '▲', '●', '▶', '★'];


function isStart( info:SampleInfo  ) {
    return info && info.type === SampleItemType.Start;
}
function isValue(info:SampleInfo ) {
    return info && info.type === SampleItemType.Value;
};
function isError(info:SampleInfo ) {
    return info && info.type === SampleItemType.Error;
};
function isComplete(info:SampleInfo) {
    return info && info.type === SampleItemType.Complete;
};
function isStop(info:SampleInfo ) {
    return info && info.type === SampleItemType.Stop;
};   

const USE_SHADOW_DOM    = true;
const MAX_SAMPLES       = 'max-samples';
const PAUSE_ATTR        = 'pause';
const TICKTIME_ATTR     = 'tick-time';

// @see
// https://dev.to/aspittel/building-web-components-with-vanilla-javascript--jho
// https://www.codementor.io/ayushgupta/vanilla-js-web-components-chguq8goz
export class RXMarbleDiagramElement extends HTMLElement {

    private container:HTMLDivElement
    private sketch:p5;
    private nbrOfSamplesReceived = 0;

    get maxNbrOfSamples() {
        return Number(this.getAttribute(MAX_SAMPLES) || 50 );
    }
    
    get tickTime() {
        return Number(this.getAttribute(TICKTIME_ATTR) || 1000);
    }

    set tickTime( v:number ) {
       this.setAttribute(TICKTIME_ATTR, String(v) );
    }

    get pause() {
        //console.log( "get pause", this.getAttribute(PAUSE_ATTR) );
        return this.getAttribute(PAUSE_ATTR)==='true';
    }

    set pause( v:boolean ) {
       //console.log( "set pause", String(v) );
       this.setAttribute(PAUSE_ATTR, String(v) );
    }
    
    static get observedAttributes() { return [PAUSE_ATTR, TICKTIME_ATTR]; }

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
    attributesChangedCallback(attribute:string, oldval:any, newval:any) {

        console.log( "update ${attribute}", oldval, newval );
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

    private processSample( s:Sample, diagram:Diagram, k$:p5 ) {
        this.nbrOfSamplesReceived++;

        let op = diagram.getOperator( s.id )

        if ( !op   ) {
            if( isStart(s) )  diagram.addOperator( k$, s.id )
            return 
        }
        
        if( isValue( s ) ) {
            diagram.next( op, s.value )
        }
        else if( isError( s ) ) {
            diagram.error( op, s.err )
        }
        else if( isComplete( s ) ) {
            diagram.complete( op )
        }

    }
    
    private sketchSetup( k$:p5 ) {
        let seconds = 0
  
        var diagram:Diagram = null 
      
        let watch = new Watch(DEFAULT_FPS)
      
        k$.setup = () => { 
            const canvas = k$.createCanvas(1024,768);
            k$.frameRate(DEFAULT_FPS);
            k$.noLoop()  
            
            canvas.style( 'visibility', 'visible' )

            diagram = createDiagram( k$, 70 )

            const eventHandler = (event:any) =>  this.processSample( event.detail, diagram, k$ )
            window.addEventListener( 'rxmarbles.event', eventHandler)

            const pauseHandler = (event:any) => diagram.pause()
            this.addEventListener( 'rxmarbles.pause', pauseHandler)

            const resumeHandler = (event:any) => diagram.resume()
            this.addEventListener( 'rxmarbles.resume', resumeHandler)
            
            this.addEventListener( 'rxmarbles.stop', (event:any) => {

                window.removeEventListener( 'rxmarbles.event', eventHandler)
                window.removeEventListener( 'rxmarbles.pause', pauseHandler)
                window.removeEventListener( 'rxmarbles.resume', resumeHandler)

                diagram.stop()
                

            })

        }
      
        k$.draw = () => {
          
          k$.background(DEFAULT_BACKGROUND);
          
          // Typography
          k$.textSize(30);
          k$.textAlign(k$.CENTER, k$.CENTER);
          k$.text( seconds, 30, 20 )
          
          watch.tick( () => ++seconds )
            
          diagram.draw( k$ )
        };

    }


    /**
     * 
     */
    public clear() {
        this.nbrOfSamplesReceived = 0;
    }

    /**
     * 
     * @param sampleFilter 
     * @param tickTime 
     */
    // private getSamples():Observable<Sample[]> {

    //     let sort = (a:SampleInfo,b:SampleInfo) => {
    //         let timeDiff = b.time - a.time ;
    //         if( timeDiff !== 0 ) return timeDiff;
    //         return b.type - a.type; 

    //     }

    //     return this.samples
    //             //.pipe( takeWhile( sample => sample.type!=SampleItemType.Complete || sample.parentId!=undefined ) )
    //             .pipe( filter( sample => this.pause===false ) )
    //             .pipe( bufferTime( this.tickTime ), map( s => s.sort( sort ) ))
    //             ;
    // }
    
    /**
     * 
     * @param tickTime 
     */
    public start() {
        
        this.sketch.loop()
    }
}

try {

    customElements.define('rxmarble-diagram', RXMarbleDiagramElement);

} catch (err) {
    console.error( err );
}
    


