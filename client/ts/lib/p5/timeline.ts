import p5 from "p5"

import { Boundary, DEFAULT_BACKGROUND, IMarbleDiagram, P5 } from './common'
import { stream } from './item'

type Props = {
  label:string;
  y:number;
}


export class Timeline implements P5.IDrawable {

    static get H()  { return 30 }    
    //static scrollFactor:number = 0

    private _items = Array<stream.Item>();
    private _completed:stream.Completed|stream.Error|null = null

    constructor( private /*WeakRef*/ owner:IMarbleDiagram, private boundary:Boundary, private props:Props ) {
      //console.log( this.boundary )
    }

    get numItems() { return this._items.length }
    
    get y() { return this.props.y }

    get isCompleted() { return this._completed != null }

    get isCompletedWithSuccess() { return this._completed instanceof stream.Completed }

    get isCompletedWithError() { return this._completed instanceof stream.Error }

    next( data:any, tick:number, relativeTo?:stream.Item ):stream.Item|undefined {
      if( this._completed ) return

      const x = ( relativeTo ) ? relativeTo.x  : this.boundary.left
      
      const item = new stream.Item( data, x + stream.Item.D, this.y, tick )

      this._items.push( item );
  
      return item

    }

    complete( tick:number, relativeTo?:stream.Item  ):stream.Item { 
      if( this._completed ) return this._completed

      const x = ( relativeTo ) ? relativeTo.x  : this.boundary.left

      this._completed = new stream.Completed( null, x  + stream.Item.D, this.y, tick ) 

      this._items.push( this._completed );

      return this._completed
    }
 
    error( e:Error, tick:number, relativeTo?:stream.Item ) { 
      if( this._completed ) return this._completed

      const x = ( relativeTo ) ? relativeTo.x  : this.boundary.left

      this._completed = new stream.Error( e, x  + stream.Item.D, this.y, tick ) 

      this._items.push( this._completed );

      return this._completed
    }

    private get visibleItems() {
      return this._items.filter( item => !item.isNotVisibleL(this.boundary) )
    }
    
    draw( k$: p5 ) {
        // Line
      k$.stroke(255)
      k$.line( this.boundary.left, this.props.y, this.boundary.right, this.props.y)

      // Items
      this.visibleItems.forEach( item =>  {
        item.scrollOffsetX += this.owner.scrollFactor
        item.draw(k$)   
      })

      // Rect
      let height = stream.Item.D + 2;

      k$.noStroke()
      k$.fill( DEFAULT_BACKGROUND )
      k$.rect( 0, this.props.y - height/2, this.boundary.left, height )

      // Typography

      k$.fill( 255 )
      k$.textSize(18)
      k$.textAlign(k$.LEFT, k$.CENTER);

      k$.text( this.props.label, 0, this.props.y )

    } 
  
  } 
  