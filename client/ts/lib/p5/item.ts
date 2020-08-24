import p5 from "p5"



export namespace stream {

  type Boundary = { left:number ; right:number }

  type Props = {
    data:any;
    px:number;
    y:number;
    tick:number
  }
  
  // export function item( props:Props ) {
  //   const { data, px, y, tick } = props 
    
  //   return new stream.Item( data, px, y, tick )
  // }

  export class Item {
    static get D() { return 30 }
  
    scrollOffsetX = 0
  
    get x() { return this.px - this.scrollOffsetX }
  
    constructor(protected data: any, protected px: number, protected y: number, protected tick:number) { }
  
    IsFullVisible(b: Boundary) {
      return (this.x > b.left && this.x < b.right - Item.D)
    }
  
    isPartialVisibleR(b: Boundary) {
      return (this.x < b.right && this.x + Item.D > b.right )
    }
  
    isNotVisibleR(b: Boundary) { 
      return (this.x >= b.right) 
    }
    
    isPartialVisibleL( b: Boundary ) {
      return (this.x < b.left && this.x > b.left-Item.D)
    }
  
    isNotVisibleL(b: Boundary) { 
      return (this.x <= b.left-Item.D) 
    }
  
    needToScrollR( b: Boundary ) {
      console.debug( `needToScrollR ${this.data} - [${b.left},${b.right}] - isPartialVisibleR(${this.x}): ${this.isPartialVisibleR( b )} - isNotVisibleR(${this.x}): ${this.isNotVisibleR( b ) }`)
      return this.isPartialVisibleR( b ) ||  this.isNotVisibleR( b ) 
    }

    draw(k$: p5) {
      k$.push()

      k$.fill( 255 )
      k$.circle(this.x, this.y, Item.D)
      
      k$.fill( 0 )
      k$.textSize(15)
      k$.textAlign(k$.CENTER, k$.CENTER);
      k$.text(this.data, this.x, this.y)
  
      k$.pop()
    }
  }
  
  export class Completed extends Item {
  
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
