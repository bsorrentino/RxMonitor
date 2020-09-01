import p5 from "p5"

import { Boundary, Queue, Watch, IMarbleDiagram, P5 } from './common'
import { stream } from './item'
import { operator, Operator } from "./operator"
import { Timeline } from "./timeline"



type OperatorMap = { 
  [key: string]:Operator 
} ;

type QItem = {
  operator:Operator;
  type:'next'|'complete'|'error'
  label?:string
  error?:Error
}

export function diagram( options:{y:number}, k$:p5 ) {
  console.assert( k$.width > 100, 'sketch width must be > %d but %d', 100, k$.width )

  return new Diagram( { left:100, right:k$.width }, options.y, k$)
}

export class Diagram implements IMarbleDiagram, P5.IDrawable {
  
    private _itemsQueue = new Queue<QItem>();
    private _operators:OperatorMap = {}
    private _watch = new Watch( 5 )
    private _lastItem:stream.Item|undefined // last item added

    private _timeline:Timeline

    constructor( private boundary:Boundary, private startY:number, k$:p5 ) {

      this._timeline = Timeline.create( {owner:this, label:"timeline", y:startY}, k$ )
    }
    
    scrollFactor: number;

    /**
     * 
     * @param k$ 
     * @param label 
     */
    addOperator( k$:p5, label:string ) {
      
      const y = Object.keys(this._operators)
                        .map( k => this._operators[k].y )
                        .reduce( ( prev, curr ) => prev + Operator.H*2, this.startY + Timeline.H*2)

      const result = operator( this, k$, { label:label, y:y} )

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
     *  interrupt the diagram
     */
    stop() {

    }

    /**
     *  interrupt the diagram
     */
    pause() {

    }

    /**
     *  interrupt the diagram
     */
    resume() {

    }

    /**
     * check if the diagram need to left scroll scroll 
     * setting the diagram scroll factor
     */
    private needToScrollR() {
      this.scrollFactor = 
        ( this._lastItem?.needToScrollR( this.boundary) ) ? 3 : 0 
    }

    /**
     * 
     * @param k$ 
     */
    draw( k$: p5 ) { 

      this._watch.tick( ( tick ) => {
        
        const qi = this._itemsQueue.pop()

        switch( qi?.type ) {
        case 'next':{
            const { operator, label } = qi

            this._lastItem = operator.next( label, tick, this._lastItem  );

          }
          break;
        case 'complete': {
            const { operator } = qi

            this._lastItem = operator.complete( tick, this._lastItem  );

          }
          break;
        case 'error': {
          const { operator, error } = qi
          
        }
          break;
        }

      })

      this._timeline.draw(k$)

      Object.keys(this._operators)
                        .map( k => this._operators[k] )
                        .forEach( o => o.draw( k$ ) )
      this.needToScrollR()
    }

  
  } 
  