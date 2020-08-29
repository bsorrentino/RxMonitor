import p5 from "p5"

import { Boundary, DEFAULT_BACKGROUND, IMarbleDiagram, P5, Watch, DEFAULT_FPS } from './common'
import { stream } from './item'


export class Timeline implements P5.IDrawable {

    static create( options:{ owner:IMarbleDiagram, label:string, y:number }, k$:p5 ):Timeline {
      return new Timeline( options.owner, { left:100, right:k$.width }, options.label, options.y)
    }
    static get H()  { return 30 }   

    private watch = new Watch(DEFAULT_FPS)

    constructor( private /*WeakRef*/ owner:IMarbleDiagram, private boundary:Boundary, private label:string, private y:number ) {
    
    }


    draw( k$: p5 ) {
        // Line
      k$.stroke(255)
      k$.line( this.boundary.left, this.y, this.boundary.right, this.y)


      // Rect
      let height = stream.Item.D + 2;

      k$.noStroke()
      k$.fill( DEFAULT_BACKGROUND )
      k$.rect( 0, this.y - height/2, this.boundary.left, height )

      // Typography

      k$.fill( 255 )
      k$.textSize(18)
      k$.textAlign(k$.LEFT, k$.CENTER);

      k$.text( this.label, 0, this.y )

    } 
  
  } 
  