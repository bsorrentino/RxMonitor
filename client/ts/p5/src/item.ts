import p5 from "p5"

type Boundary = { left:number ; right:number }

type Props = {
  data:any;
  px:number;
  y:number;
  tick:number
}

export function item( props:Props ) {
  const { data, px, y, tick } = props 
  
  return new Item( data, px, y, tick )
}

export class Item {

  scrollOffsetX = 0

  static get D() { return 30 }
  get x() { return this.px - this.scrollOffsetX }

  constructor(private data: any, private px: number, private y: number, private tick:number) { }

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

  draw(k$: p5) {
    k$.fill( 255 )
    k$.circle(this.x, this.y, Item.D)
    
    k$.fill( 0 )
    k$.textSize(15)
    k$.textAlign(k$.CENTER, k$.CENTER);
    k$.text(this.data, this.x, this.y)

  }
}