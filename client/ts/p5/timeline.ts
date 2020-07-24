import p5 from "p5"

import { Boundary } from './common'
import { Item } from './item'
import { operator, Operator } from "./operator"

class Queue<T> {

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


type OperatorMap = { 
  [key: string]:Operator 
} ;

type QItem = {
  operator:Operator;
  label:string
}

export function timeline( k$:p5, y:number ) {
  return new TimeLine( { left:100, right:k$.width }, y)
}

export class TimeLine  {
  
    private _itemsQueue = new Queue<QItem>();
    private _operators:OperatorMap = {}
    private _watch = new Watch( 5 )
    private _lastItem:Item|undefined // last item added

    constructor( private boundary:Boundary, private startY:number ) {
      //console.log( this.boundary )
    }

    /**
     * 
     * @param k$ 
     * @param label 
     */
    addOperator( k$:p5, label:string ) {
      
      const y = Object.keys(this._operators)
                        .map( k => this._operators[k].y )
                        .reduce( ( prev, curr ) => prev + Operator.H*2, this.startY)

      this._operators[ label ] = operator( k$, { label:label, y:y} )
    }

    /**
     * 
     * @param operatorLabelOrIndex 
     * @param item 
     */
    next( operatorLabelOrIndex:string|number, item:string ) {
      
      const keys = Object.keys(this._operators)

      let key:string 
      if( typeof operatorLabelOrIndex === 'number') {
        key = keys[ Number(operatorLabelOrIndex)]     
      }
      else {
        key = operatorLabelOrIndex
      }
      const operator = this._operators[key]

      this._itemsQueue.push( { operator:operator, label:item} ) 
    }

    needToScrollR() {
      return this._lastItem?.isPartialVisibleR( this.boundary ) || 
                      this._lastItem?.isNotVisibleR( this.boundary ) 
    }

    /**
     * 
     * @param k$ 
     */
    draw( k$: p5 ) { 

      let scrollFactor = 0

      this._watch.tick( ( tick ) => {
        
        const qi = this._itemsQueue.pop()

        if( qi ) {

          const { operator, label } = qi

          this._lastItem = operator.next( label, tick, this._lastItem  );

          if( this.needToScrollR() ) {
            Operator.scrollFactor = 1
          }

        }

      })

      Object.keys(this._operators)
                        .map( k => this._operators[k] )
                        .forEach( o => o.draw( k$ ) )
    }

  
  } 
  