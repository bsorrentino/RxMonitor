
declare function showMarbles(div:Element, samples$:Observable, options?:any):any;

namespace rxmarbles {

export type ExampleCode = { code:string } & Example;

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
    constructor( div:HTMLDivElement, public stepInMs:number ) {
        // Sampler ticker
        let ticker = Observable.interval(stepInMs).filter( () => !this.isPaused );
        // Sample items
        this._logger = new SamplerLogger(ticker);
        // Draw marble diagram
        this._diagram   = showMarbles(div, this._logger.getSamples());

        Observable.logger = this._logger;
    }

    /**
     * 
     * @param example 
     */
    startExample( example:ExampleCode ):ExampleState {

        if( !example ) throw new Error( "example argument in null!");

        this._diagram.clear();

        // Add to history
        window.history.pushState(example.code, example.name, "#" + example.code);

        const state = new ExampleState( this, example, () => {
            // Complete stops before sample is completed
            setTimeout( () => {
                let startEl = document.getElementById('example__start') as HTMLInputElement;;
                startEl.checked = false;

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
export function create( element = "marble", stepInMs:number = 200 ):RxMarbles {
    return new RxMarbles( document.getElementById(element) as HTMLDivElement, stepInMs );
}



}