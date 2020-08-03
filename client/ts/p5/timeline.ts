import p5 from "p5"

import { Boundary } from './common'
import { stream } from './item'
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
  type:'next'|'complete'|'error'
  label?:string
  error?:Error
}

export function timeline( k$:p5, y:number ) {
  return new TimeLine( { left:100, right:k$.width }, y)
}

export class TimeLine  {
  
    private _itemsQueue = new Queue<QItem>();
    private _operators:OperatorMap = {}
    private _watch = new Watch( 5 )
    private _lastItem:stream.Item|undefined // last item added

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

      const result = operator( k$, { label:label, y:y} )

      this._operators[ label ] = result
      
      return result
    }

    /**
     * 
     * @param operatorLabelOrIndex 
     */
    getOperator( operatorLabelOrIndex:string|number ) {
      const keys = Object.keys(this._operators)

      let key:string 
      if( typeof operatorLabelOrIndex === 'number') {
        key = keys[ Number(operatorLabelOrIndex)]     
      }
      else {
        key = operatorLabelOrIndex
      }
      return this._operators[key]

    }

    /**
     * 
     * @param operatorLabelOrIndex 
     * @param item 
     */
    next( operator:Operator, item:string ) {
      
      this._itemsQueue.push( { operator:operator, type:'next', label:item} ) 
    }

    /**
     * 
     * @param operatorLabelOrIndex 
     * @param item 
     */
    complete( operator:Operator ) {
      
      this._itemsQueue.push( { operator:operator, type:'complete'} ) 
    }

    /**
     * 
     * @param operatorLabelOrIndex 
     * @param item 
     */
    error( operator:Operator, e:Error ) {

      this._itemsQueue.push( { operator:operator, type:'error', error:e} ) 
    }

    /**
     * 
     */
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

        switch( qi?.type ) {
        case 'next':{
            const { operator, label } = qi

            this._lastItem = operator.next( label, tick, this._lastItem  );

            if( this.needToScrollR() ) {
              Operator.scrollFactor = 1
            }
          }
          break;
        case 'complete': {
            const { operator } = qi

            this._lastItem = operator.complete( tick, this._lastItem  );

            if( this.needToScrollR() ) {
              Operator.scrollFactor = 1
            }
          }
          break;
        case 'error': {
          const { operator, error } = qi

          this._lastItem = operator.error( error!, tick, this._lastItem  );

          if( this.needToScrollR() ) {
            Operator.scrollFactor = 1
          }
        }
          break;
        }

      })

      Object.keys(this._operators)
                        .map( k => this._operators[k] )
                        .forEach( o => o.draw( k$ ) )
    }

  
  } 
  