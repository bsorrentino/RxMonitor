import p5 from "p5"

export const DEFAULT_BACKGROUND = 51

export const DEFAULT_FPS = 30

export type Boundary = { left:number ; right:number }

export class Queue<T> {

    private elements = Array<T>()
  
    get length() { return this.elements.length }
  
    isEmpty() { return this.elements.length  == 0 } 
    
    push( e:T ) { return this.elements.push(e) }
  
    pop() { return this.elements.shift() }
  
    peek() { return this.isEmpty() ? undefined : this.elements[0] }
  
}
  
export class Watch {
    ticks = 0;

    constructor( private framesPerTick:number) {}

    tick( onTick: ( tick:number ) => void) {
        if( ++this.ticks%this.framesPerTick == 0 ) {
        onTick( this.ticks ) 
        
        }
    }

}
  
export interface IMarbleDiagram {

    readonly scrollFactor:number
}

export namespace P5 {
    
    export interface IDrawable {

        draw( k$: p5 ):void;
    }
}
