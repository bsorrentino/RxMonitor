import p5 from 'p5'

import { DEFAULT_BACKGROUND, DEFAULT_FPS, Watch } from '../../lib/p5/common'
import { diagram as diagramFactory, Diagram } from '../../lib/p5/diagram'


function s(k$: p5) {
    
  let diagram:Diagram

  let emitter = new Watch(5)

  k$.setup = () => { 
    k$.createCanvas(1024,768);
    k$.frameRate(DEFAULT_FPS);

    diagram = diagramFactory( {y:70}, k$ )
    diagram.addOperator( k$, 'operator 1' );
    diagram.addOperator( k$, 'operator 2' );
    diagram.addOperator( k$, 'operator 3' );
    diagram.addOperator( k$, 'operator 4' );
    diagram.addOperator( k$, 'result' );
  }

  k$.draw = () => {
    
    k$.background(DEFAULT_BACKGROUND);
    
    emitter.tick( (tick) => {
        const tlindex = k$.floor(k$.random( 0, 5))
        //console.log( tlindex )

        const op = diagram.getOperator(tlindex)

        if( !op.isCompleted )  {
          diagram.next( op, String(tick) )

          if( tick == 100 ) {
            diagram.error( op, new Error() )
          }
        }

    })

    diagram.draw( k$ )
  };


}

const _ = new p5(s);