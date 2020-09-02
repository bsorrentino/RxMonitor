/// <reference path="../lib/marble-diagram-element.d.ts" />

import {  
    Observable, 
    MonoTypeOperatorFunction,
    PartialObserver,
    Observer
} from 'rxjs';

import { SampleItemType, Sample } from '../lib/marble-types';

import { Subscription } from 'rxjs';

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

export function watch<T>( parentId:string, id?:string ):MonoTypeOperatorFunction<T> {

    return (source:Observable<T>) => new Observable<T>( observer =>  {

        return source.subscribe(observeAndNotify( observer, id || parentId, id ? parentId : undefined ) );
    })
}

class StreamsInfo {
    [ id:string ]:number;

}

let _ids:StreamsInfo = {}

//var _eventSeq = 0;
//let eventTime = () => ++_eventSeq;

let eventTime = () => (performance) ? performance.now() : Date.now() ;


/**
 * 
 * @param observer 
 * @param id 
 * @param parentId 
 */
export function observeAndNotify<T>( observer:Observer<T> , id:string, parentId?:string ):PartialObserver<T> 
{
    console.log( 'id=', id,  'parentId=', parentId );

    const _id =  (() => {
        if( _ids[id]===undefined ) {
            _ids[id] = 0;
            return id;
        }
        return id + String(++_ids[id]);
    })();

    const event:Sample = {
        type: SampleItemType.Start,
        time: eventTime(),
        id:_id,
        parentId:parentId,
        name:_id,
        createdByValue: true,
        isIntermediate:false
    };
    window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));

    return {
        next: (v:any) => {
            const event:Sample = {
                type: SampleItemType.Value,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id,
                value: v
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.next(v);
        },
        error: (err:any) => {
            console.log( id, parentId, name, err );
            const event:Sample = {
                type: SampleItemType.Error,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id,
                err:err
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.error(err);
        },
        complete: () => {
            const event:Sample = {
                type: SampleItemType.Complete,
                time: eventTime(),
                id:_id,
                parentId:parentId,
                name:_id
            };
            window.dispatchEvent( new CustomEvent('rxmarbles.event', { detail: event } ));
            observer.complete();
        }
    }
};


