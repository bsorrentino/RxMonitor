import p5 from "p5"
import { P5, Viewport } from './common'

type GlobalError = Error

export namespace stream {

  // export function item( props:Props ) {
  //   const { data, px, y, tick } = props 
    
  //   return new stream.Item( data, px, y, tick )
  // }

  export class Item implements P5.IDrawable {
    static get D() { return 30 }
    
    static of( args:{
      data:any;
      x:number;
      y:number;
      tick:number
    } ):Item {
      return new Item( args.data, args.x, args.y, args.tick )
    }


    scrollOffsetX = 0
  
    get x() { return this._x - this.scrollOffsetX }
  
    constructor(protected data: any, protected _x: number, protected y: number, protected tick:number) { }
  
    IsFullVisible(b: Viewport) {
      return (this.x > b.left && this.x < b.right - Item.D)
    }
  
    isPartialVisibleR(b: Viewport) {
      return (this.x < b.right && this.x + Item.D > b.right )
    }
  
    isNotVisibleR(b: Viewport) { 
      return (this.x >= b.right) 
    }
    
    isPartialVisibleL( b: Viewport ) {
      return (this.x < b.left && this.x > b.left-Item.D)
    }
  
    isNotVisibleL(b: Viewport) { 
      return (this.x <= b.left-Item.D) 
    }
  
    needToScrollR( b: Viewport ) {
      return this.isPartialVisibleR( b ) ||  this.isNotVisibleR( b ) 
    }

    draw(k$: p5) {
      k$.push()

      k$.stroke( 0 )
      k$.fill( 255 )
      k$.circle(this.x, this.y, Item.D)
      
      k$.noStroke()
      k$.fill( 0 )
      k$.textSize(15)
      k$.textAlign(k$.CENTER, k$.CENTER);
      k$.text(this.data, this.x, this.y)
  
      k$.pop()
    }
  }
  
  export class Completed extends Item {
    static of( args:{
      x:number;
      y:number;
      tick:number
    } ):Completed {
      return new Completed( null, args.x, args.y, args.tick )
    }

    draw(k$: p5) {
      k$.push()

      k$.stroke(255)
      k$.strokeWeight(5)
      const hh = Item.D/2 - 3
      k$.line( this.x, this.y - hh, this.x, this.y + hh )

      k$.pop()
    }
  } 
  
  
  export class Error extends Item {

    static of( args:{
      data: GlobalError,
      x:number;
      y:number;
      tick:number
    } ):Error {
      return new Error( args.data, args.x, args.y, args.tick )
    }
  
    draw(k$: p5) {
      k$.push()

      k$.stroke( k$.color(255, 0, 0) )
      k$.strokeWeight(4)
      const hh = Item.D/2 - 3
      k$.line( this.x - hh, this.y - hh, this.x + hh, this.y + hh )
      k$.line( this.x + hh, this.y - hh, this.x - hh, this.y + hh )
      
      k$.pop()
    }
  } 
}
