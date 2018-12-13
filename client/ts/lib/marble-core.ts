
import { 
    SamplerLogger, 
 } from './marble-handler';

 import {
     showMarbles
 } from './marble-ui';
 
export interface Observer<T>  {
    next?:(( e:T ) => void);
    error?:(( e:any ) => void);
    complete?:(() => void);

    producerId?:string;
}

export class Observable<T> {

    constructor( private producer:((observer:Observer<T>) => () => any )) {

    }

    static interval(intervalInMs:number) {
        return new this( (observer:Observer<number>) => {
            var counter = 0;
            var cancellationToken = setInterval(() => {
                observer.next(counter++);
            }, intervalInMs || 0);
            return () => clearTimeout(cancellationToken);
        });
    }

    private startProducer(observer:Observer<T>) {

        var isStopped = false;

        let next = observer.next, error = observer.error, complete = observer.complete;
        // used functions for better error stack
        observer.next = (val:T) => next.call(observer, val);
        
        observer.error = (err:any) => {
            error.call(observer, err);

            if (!isStopped) isStopped = true;

        }
    
        observer.complete = () => { 
            complete.call(observer);

            if (!isStopped) isStopped = true;

        }

        var unsubscribe = this.producer(observer);
        return () => { 
                unsubscribe();

                if (!isStopped) isStopped = true;

        }
        
    };

    private createObserver(getUnsubscribe:(()=>any), _observer?:Observer<T>) {
        let nextHandler =       (_observer ? _observer.next : undefined) || (() => <any>undefined );
        let errorHandler =      (_observer ? _observer.error : undefined ) || (() => <any>undefined);
        let completeHandler =   (_observer ? _observer.complete : undefined ) || (() => <any>undefined);

        let unsubscribeOnce = () => {
            if (!isEnded) {
                isEnded = true;
                // When producers calls complete/error (or next in error) synchronious, unsubscribe is undefined
                var unsubscribe = getUnsubscribe();
                if (typeof unsubscribe === "function")
                    unsubscribe();
            }
        };
        var isEnded = false;

        let observer = {
            next: (value:any) => {
                if (!isEnded) {
                    try {
                        nextHandler(value);
                    }
                    catch (err) {
                        errorHandler(err);
                        unsubscribeOnce();
                        throw err;
                    }
                }
            },
            error: (err:any) => {
                if (!isEnded) {
                    errorHandler(err); // No need to catch
                    unsubscribeOnce();
                }
            },
            complete: () => {
                if (!isEnded) {
                    completeHandler(); // No need to catch, complete shouldn't call error
                    unsubscribeOnce();
                }
            }
        };
        return {
            observer: observer,
            unsubscribe: unsubscribeOnce
        };
    };

    subscribe( _observer?:Observer<T> ) {

        var unsubscribe:(()=>void);
        let _a = this.createObserver(() => unsubscribe, _observer);

        let observer = _a.observer;
        let unsubscribeOnce = _a.unsubscribe;
        // Start producer at each subscription
        unsubscribe = this.startProducer(observer);
        return unsubscribeOnce;
    
    }

    filter(predicate:((e:T) => boolean)) {

        return new Observable((_a:Observer<T>) => {
            let next = _a.next, error = _a.error, complete = _a.complete, producerId = _a.producerId;
            return this.subscribe({
                next: (val:T) => {
                    if (next && predicate(val))
                        next(val);
                },
                error: error,
                complete: complete
            });
        });
    };

    
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
export function create( element = "marble", stepInMs:number = 200 ):RxMarbles {
    return new RxMarbles( document.getElementById(element) as HTMLDivElement, stepInMs );
}



