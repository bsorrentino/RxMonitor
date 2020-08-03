/** Simple Quick & Dirty marble visualizer, POJS no framework */
import p5 from 'p5'
import { Observable, Subject } from 'rxjs';
import { bufferTime, map, tap, filter, takeWhile } from 'rxjs/operators';
import { SampleItemType, Sample, SampleInfo } from '../lib/marble-types';

import { BACKGROUND, FPS } from './common'
import { timeline as timelineFactory, TimeLine, Watch } from './timeline'

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
export class RXMarbleDiagramP5Element extends HTMLElement {

    private samples = new Subject<Sample>();  

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

        window.addEventListener( 'rxmarbles.event', (event:any) => this.samples.next( event.detail ))
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

    private sketchSetup( k$:p5 ) {
        let seconds = 0
  
        let diagram:TimeLine
      
        let watch = new Watch(FPS)
      
        k$.setup = () => { 
          const canvas = k$.createCanvas(1024,768);
          k$.frameRate(FPS);
          k$.noLoop()  
          
          canvas.style( 'visibility', 'visible' )
          
          diagram = timelineFactory( k$, 70 )
        }
      
        k$.draw = () => {
          
          k$.background(BACKGROUND);
          
          // Typography
          k$.textSize(30);
          k$.textAlign(k$.CENTER, k$.CENTER);
          k$.text( seconds, 30, 20 )
          
          watch.tick( () => ++seconds )
            
          diagram.draw( k$ )
        };

        function addSample(sample:Array<Sample>) {
            // Create required operators
            sample
                .reverse()
                .forEach( s => {

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

                })
        }


        this.getSamples()
            .subscribe( { 
                next: (sample:any) => {
                    this.nbrOfSamplesReceived++;
                    addSample(sample);
                }
        });

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
    private getSamples():Observable<Sample[]> {

        let sort = (a:SampleInfo,b:SampleInfo) => {
            let timeDiff = b.time - a.time ;
            if( timeDiff !== 0 ) return timeDiff;
            return b.type - a.type; 

        }

        return this.samples
                .pipe( takeWhile( sample => sample.type!=SampleItemType.Complete || sample.parentId!=undefined ) )
                .pipe( filter( sample => this.pause===false ) )
                .pipe( bufferTime( this.tickTime ), map( s => s.sort( sort ) ))
                ;
    }
    
    /**
     * 
     * @param tickTime 
     */
    public start() {
        
        this.sketch.loop()
    }
}

try {

    customElements.define('rxmarble-p5-diagram', RXMarbleDiagramP5Element);

} catch (err) {
    console.error( err );
}
    


