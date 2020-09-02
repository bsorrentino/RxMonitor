import p5 from "p5"

import { Viewport, DEFAULT_BACKGROUND, IMarbleDiagram, P5, Watch, DEFAULT_FPS } from './common'
import { stream } from './item'

export class Timeline implements P5.IDrawable {

    static of( options:{ owner:IMarbleDiagram, label:string, y:number }, k$:p5 ):Timeline {
      return new Timeline( options.owner, { left:100, right:k$.width }, options.label, options.y)
    }
    static get H()  { return 30 }   

    get pointPerSecs() { return 128 }

    get seconds() { return  this._seconds }

    private _seconds = 0

    private eachSeconds = new Watch(DEFAULT_FPS)

    private viewport:{ width:number, width2: number} & Viewport

    private doubleBuffer:DoubleSecsBuffer;

    private scrollOffsetX = 0

    
    constructor( private /*WeakRef*/ owner:IMarbleDiagram, viewport:Viewport, private label:string, private y:number ) {

      const w = viewport.right // - viewport.left 
      
      this.viewport = {
        width:w,
        width2:w * 2,
        left:viewport.left,
        right:viewport.right
      }

      const maxNumberSecsDisplayable = w / this.pointPerSecs
      
      console.assert( w%this.pointPerSecs == 0, 'this algorithm works only if pointPerSecs is a multiple of viewport width!' )

      this.doubleBuffer = new DoubleSecsBuffer(maxNumberSecsDisplayable)

      this.doubleBuffer.primary.start = 0
      this.doubleBuffer.primary.translateX(viewport.right, this.pointPerSecs)

    }

    private drawSecond(sec:number, xx:number, k$: p5) {
      k$.stroke(255)
      k$.line(xx, this.y - 4, xx, this.y + 4)
      k$.textSize(14)
      k$.textAlign(k$.CENTER, k$.TOP);
      k$.text( sec, xx, this.y+7 )
    }

    draw( k$: p5 ) {

      // Line
      k$.stroke(255)
      k$.line( this.viewport.left, this.y, this.viewport.right, this.y)


      // Seconds
        
      ++this.scrollOffsetX
  
      if(this.scrollOffsetX==this.viewport.width2 ) {
        
        this.doubleBuffer.flip()
        this.doubleBuffer.primary.substractX(this.viewport.width)
        
        this.scrollOffsetX -= this.viewport.width
      }
    
      if(this.scrollOffsetX==this.viewport.width) {
        
        let startX = this.viewport.right + this.viewport.width
        
        this.doubleBuffer.secondary.start = this.doubleBuffer.primary.end   
        this.doubleBuffer.secondary.translateX( startX, this.pointPerSecs )
        
      }
    
      
      
      this.eachSeconds.tick( () => ++this._seconds )

      this.doubleBuffer.forEach( ( b, i ) => {
        let x = b.data[i] - this.scrollOffsetX
        this.drawSecond( b.start + i, x, k$)
      })

      // Rect
      let height = 40;

      k$.noStroke()
      k$.fill( DEFAULT_BACKGROUND )
      k$.rect( 0, this.y - height/2, this.viewport.left, height )

      // Typography

      k$.fill( 255 )
      k$.textSize(18)
      k$.textAlign(k$.LEFT, k$.CENTER);

      k$.text( this.label, 0, this.y )
      
    } 
  
  } 
  
  // time line


class SecsBuffer {
  
  data:Array<number>
  start = 0

  constructor( numSecs:number ) {
    this.data = Array(numSecs) 
    this.start = 0
  }
  
  get lastX():number { return this.data[ this.data.length - 1] }

  get end():number { return this.start + this.data.length }

  get length() { return this.data.length }

  translateX( startX:number, pointPerSecs:number) {
    for (let i = 0; i < this.data.length; ++i) {
      this.data[i] = startX + (pointPerSecs * i)
    }
  }

  substractX( offset:number ) {
    for (let i = 0; i < this.data.length; ++i) {
      this.data[i] -= offset
    }
  }  
  
}

class DoubleSecsBuffer {

  private _primary = 0
  private _secondary = 1
  data:[ SecsBuffer, SecsBuffer ]

  constructor( numSecs:number ) {
    this.data = [ new SecsBuffer(numSecs), new SecsBuffer(numSecs) ]
  }  
  
  get primary() { return this.data[this._primary] }
  
  get secondary() { return this.data[this._secondary] }
  
  flip() {
    let v = this._primary
    this._primary = this._secondary
    this._secondary = v
  }
  
  /**
   * 
   * @param {function( buffer:SecsBuffer, index?:number ) } callback 
   */
  forEach( callback:( buffer:SecsBuffer, index?:number ) => void ) {
    for (let i = 0; i <= this.primary.length; ++i) {
        callback( this.primary, i )
    }    
    for (let ii = 0; ii <= this.secondary.length; ++ii) {
        callback( this.secondary, ii )
    }    
  }
  
}

