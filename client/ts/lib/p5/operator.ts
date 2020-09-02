import p5 from "p5"

import { Viewport, DEFAULT_BACKGROUND, IMarbleDiagram, P5} from './common'
import { stream } from './item'


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
    
    get y() { return this._y }

    get isCompleted() { return this._completed != null }

    get isCompletedWithSuccess() { return this._completed instanceof stream.Completed }

    get isCompletedWithError() { return this._completed instanceof stream.Error }

    next( data:any, tick:number, relativeTo?:stream.Item ):stream.Item|undefined {
      if( this._completed ) return

      const x = ( relativeTo ) ? relativeTo.x  : this.viewport.right
      
      const item = stream.Item.of( { data: data, x: x + stream.Item.D, y: this.y, tick: tick } )

      this._items.push( item );
  
      return item

    }

    complete( tick:number, relativeTo?:stream.Item  ):stream.Item { 
      if( this._completed ) return this._completed

      const x = ( relativeTo ) ? relativeTo.x  : this.viewport.left

      this._completed = stream.Completed.of( {x: x + stream.Item.D, y: this.y, tick: tick } ) 

      this._items.push( this._completed );

      return this._completed
    }
 
    error( e:Error, tick:number, relativeTo?:stream.Item ) { 
      if( this._completed ) return this._completed

      const x = ( relativeTo ) ? relativeTo.x  : this.viewport.left

      this._completed = stream.Error.of( {data: e, x: x + stream.Item.D, y: this.y, tick: tick} ) 

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
  