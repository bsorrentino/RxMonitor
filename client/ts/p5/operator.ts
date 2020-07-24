import p5 from "p5"

import { Boundary, BACKGROUND} from './common'
import { Item } from './item'

type Props = {
  label:string;
  y:number;
}

export function operator( k$:p5, props:Props ) {
  return new Operator( { left:100, right:k$.width }, props)
}

export class Operator  {

    static get H()  { return 30 }

    private _items = Array<Item>();
    
    static scrollFactor:number = 0

    constructor( private boundary:Boundary, private props:Props ) {
      //console.log( this.boundary )
    }

    get numItems() { return this._items.length }
    
    get y() { return this.props.y }


    next( data:any, tick:number, relativeTo?:Item ) {

      const x = ( relativeTo ) ? relativeTo.x  : this.boundary.left
      
      const item = new Item( data, x + Item.D, this.y, tick )

      this._items.push( item );
  
      return item

    }

    complete(  ) {

    }
 
    error(  ) {

    }

    draw( k$: p5 ) {

      // Line

      k$.stroke(255)
      k$.line( this.boundary.left, this.props.y, this.boundary.right, this.props.y)

      // Items
      this._items.filter( item => !item.isNotVisibleL(this.boundary) ).forEach( (item,i) =>  {
    
        item.scrollOffsetX += Operator.scrollFactor
        item.draw(k$)
  
      })

      // Rect
      let height = Item.D + 2;

      k$.noStroke()
      k$.fill( BACKGROUND )
      k$.rect( 0, this.props.y - height/2, this.boundary.left, height )

      // Typography

      k$.fill( 255 )
      k$.textSize(18)
      k$.textAlign(k$.LEFT, k$.CENTER);

      k$.text( this.props.label, 0, this.props.y )

    } 
  
  } 
  