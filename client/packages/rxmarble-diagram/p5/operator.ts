import p5 from "p5"

import { Viewport, DEFAULT_BACKGROUND, IMarbleDiagram, P5} from './common'
import { stream } from './item'

type LastItem = { item?:stream.Item ; event?: Sample }

export class Operator implements P5.IDrawable {

    static  of( args:{ owner:IMarbleDiagram, label:string, y:number }, k$:p5):Operator {
      return new Operator( args.owner, { left:100, right:k$.width }, args.label, args.y )
    }

    static get H()  { return 30 }    

    private _items = Array<stream.Item>();
    private _completed:stream.Completed|stream.Error|null = null

    constructor( private /*WeakRef*/ owner:IMarbleDiagram, private viewport:Viewport, private label:string, private _y:number ) {
      //console.log( this.boundary )

    }

    get numItems() { return this._items.length }
    
    get lastItem():stream.Item|undefined {  
      const n = this._items.length
      if( n > 0 )
        return this._items[n-1]
    } 

    get y() { return this._y }

    get isCompleted() { return this._completed != null }

    get isCompletedWithSuccess() { return this._completed instanceof stream.Completed }

    get isCompletedWithError() { return this._completed instanceof stream.Error }

    private getNextItemX( eventData:Sample, relativeTo:LastItem ) {

      const { item, event } = relativeTo

      const x = ( item ) ? item.x  : this.viewport.right

      

      if( event ) {
        const timePassed = Math.round(eventData.time - event.time)

        if( timePassed > 0 ) {
          //console.debug( 'time difference respect the last item emitted',  timePassed )
          return x  + stream.Item.D + 2
        }

      }
      if( this.lastItem && this.lastItem.x == x ) {
        console.debug( `override item detection on ${this.label}` )
        return x + Math.floor(stream.Item.D / 2)
      }

      return x
        
    }

    next( eventData:Sample, tick:number, relativeTo:LastItem ):stream.Item|undefined {
      if( this._completed ) return
  
      const x = this.getNextItemX( eventData, relativeTo)

      const result = stream.Item.of( { data: eventData.value, x: x, y: this.y, tick: tick } )

      this._items.push( result );
  
      return result

    }

    complete( _:Sample, tick:number, relativeTo:LastItem ):stream.Item { 
      if( this._completed ) return this._completed

      const { item } = relativeTo

      const x = ( item ) ? item.x  : this.viewport.left

      this._completed = stream.Completed.of( {x: x + stream.Item.D, y: this.y, tick: tick } ) 

      this._items.push( this._completed );

      return this._completed
    }
 
    error( eventData:Sample, tick:number, relativeTo:LastItem ) { 
      if( this._completed ) return this._completed

      const { item } = relativeTo
      const x = ( item ) ? item.x  : this.viewport.left

      this._completed = stream.Error.of( {data: eventData.err, x: x + stream.Item.D, y: this.y, tick: tick} ) 

      this._items.push( this._completed );

      return this._completed
    }

    private get visibleItems() {
      return this._items.filter( item => !item.isNotVisibleL(this.viewport) )
    }
    
    draw( k$: p5 ) {
        // Line
      k$.stroke(255)
      k$.line( this.viewport.left, this._y, this.viewport.right, this._y)

      // Items
      this.visibleItems.forEach( item =>  {
        item.scrollOffsetX += this.owner.scrollFactor
        item.draw(k$)   
      })

      // Rect
      let height = stream.Item.D + 2;

      k$.noStroke()
      k$.fill( DEFAULT_BACKGROUND )
      k$.rect( 0, this._y - height/2, this.viewport.left, height )

      // Typography

      k$.fill( 255 )
      k$.textSize(18)
      k$.textAlign(k$.LEFT, k$.CENTER);

      k$.text( this.label, 0, this._y )

    } 
  
  } 
  