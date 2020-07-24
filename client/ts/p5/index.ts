import p5 from 'p5'

import { BACKGROUND, FPS } from './common'
import { timeline as timelineFactory, TimeLine, Watch } from './timeline'


function s(k$: p5) {
    
  let seconds = 0
  
  let timeLine:TimeLine

  let watch = new Watch(FPS)
  let emitter = new Watch(5)

  k$.setup = () => { 
    k$.createCanvas(1024,768);
    k$.frameRate(FPS);

    timeLine = timelineFactory( k$, 70 )
    timeLine.addOperator( k$, 'operator 1' );
    timeLine.addOperator( k$, 'operator 2' );
    timeLine.addOperator( k$, 'operator 3' );
    timeLine.addOperator( k$, 'operator 4' );
    timeLine.addOperator( k$, 'result' );
  }

  k$.draw = () => {
    
    k$.background(BACKGROUND);
    
    // Typography
    k$.textSize(30);
    k$.textAlign(k$.CENTER, k$.CENTER);
    k$.text( seconds, 30, 20 )

    
    watch.tick( () => ++seconds )

    emitter.tick( (tick) => {
        const tlindex = k$.floor(k$.random( 0, 5))
        //console.log( tlindex )

        const op = timeLine.getOperator(tlindex)

        if( !op.isCompleted )  {
          timeLine.next( op, String(tick) )
        }

        //if( tick == 100 ) {
        //  timeLine.complete( tlindex )
        //}
    })

    timeLine.draw( k$ )
  };


}

const _ = new p5(s);