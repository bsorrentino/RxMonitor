
declare function showMarbles(div:Element, samples$:Observable, options?:any):any;

namespace rxmarbles {

export type ExampleCode = { code:string } & Example;

// Time of one step

export class ExampleState {
    

    isPaused = false;

    constructor( private marbles:RxMarbles, private _example:ExampleCode, private unsubscribe:() => void) {
        if( !_example ) throw new Error( "example in null!");


    }

    get isStopped() {
        return !this.unsubscribe;        
    }

    /**
     * 
     * @param unsubscribe 
     */
    stop( ) {

        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
        this.marbles.isPaused = this.isPaused = true;
        return this;
    }

    pause() {
        this.marbles.isPaused = this.isPaused = true;
        return this;
    }

    resume() {
        if (this.isStopped) throw new Error( this._example.name + " already stopped!" );
        this.marbles.isPaused = this.isPaused = false;
        return this;
    }
    
    toggle( ) {
        if ( this._example.onlyStop) {
            console.log( this.isPaused ? "resume" : "pause" )            
            return this.isPaused ? this.resume( ) : this.pause();
        }
        else {
            console.log( this.isPaused ? "start" : "stop" )
            return this.isPaused ? this.marbles.startExample( this._example ) : this.stop();
        }
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

        let state = new ExampleState( this, example, example.exec( () => {
            // Complete stops before sample is completed
            setTimeout( () => {
                state.stop();
                let startEl = document.getElementById('example__start') as HTMLInputElement;;
                startEl.checked = false;
            }, this.stepInMs + 50);
        }) )

        return state;
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