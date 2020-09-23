import p5 from "p5"

import { Viewport, Queue, Watch, IMarbleDiagram, P5, DEFAULT_FPS } from './common'
import { stream } from './item'
import { Operator } from "./operator"



type OperatorMap = { 
  [key: string]:Operator 
} ;

type QItem = {
  operator:Operator;
  eventData:Sample
}

type LastItem = { item?:stream.Item ; event?:Sample }

export function diagram( options:{y:number}, k$:p5 ) {
  console.assert( k$.width > 100, 'sketch width must be > %d but %d', 100, k$.width )

  return new Diagram( { left:100, right:k$.width }, options.y, k$)
}

export class Diagram implements IMarbleDiagram, P5.IDrawable {
  
    private _itemsQueue = new Queue<QItem>();
    private _operators:OperatorMap = {}
    private _watch = new Watch( 1 /*DEFAULT_FPS*/ )
    private _lastItem:LastItem = {} // last item added

    scrollFactor: number;

    constructor( private viewport:Viewport, private startY:number, k$:p5 ) {
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

      const result = Operator.of( { owner:this, label:label, y:y }, k$ )

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
     * @param operator 
     * @param eventData 
     */
    processEvent( eventData:Sample, operator:Operator ) {
      this._itemsQueue.push( { operator:operator, eventData:eventData} ) 
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
     * 
     */
    private isItemInResult( event?:Sample ):boolean {
      return ( event?.id!==undefined && event?.parentId===undefined )
    }

    /**
     * check if the diagram need to left scroll scroll 
     * setting the diagram scroll factor
     */
    private processScrollR() {
      
      const need2Scroll = this._lastItem.item?.needToScrollR( this.viewport)

      this.scrollFactor = (need2Scroll) ? 1 :  0 

    }

    /**
     * 
     * @param k$ 
     */
    draw( k$: p5 ) { 

      this._watch.tick( ( tick ) => {
        
        if( this._itemsQueue.isEmpty() ) return;

        const qi = this._itemsQueue.pop()

        const { operator, eventData } = qi
        
        switch( eventData.type ) {
        case 'value':
          this._lastItem.item = operator.next( eventData, tick, this._lastItem  )
          break;
        case 'complete':
          this._lastItem.item = operator.complete(eventData,  tick, this._lastItem  )
          if( this.isItemInResult(eventData)) {
            this._watch.stop()
          }
          break;
        case 'error':
          this._lastItem.item = operator.error( eventData, tick, this._lastItem  )
          break;
        }

        this._lastItem.event = eventData

      })

      Object.keys(this._operators)
                        .map( k => this._operators[k] )
                        .forEach( o => o.draw( k$ ) )
      this.processScrollR();
    }

  
  } 
  