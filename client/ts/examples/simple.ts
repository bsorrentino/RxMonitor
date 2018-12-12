
var marbles:rxmarbles.RxMarbles;
var currentExample:rxmarbles.ExampleState;

window.addEventListener('load',  () => { 

    let producerId = '1';
    let name = "test";

    let shapes$:rxmarbles.ExampleCode = {
        autoPlay: true,
        exec: () => {

            rxmarbles.onStart( {   
                id:producerId, 
                name:name, 
                //parentId:parentProducerId, 
                createdByValue:true, 
                isIntermediate:false
            });

            [ 'A', 'B', 'C', 'D', 'E'].forEach( (val, index ) => {
                setTimeout( () => {
                    console.log( "val", val);

                    rxmarbles.onValue({   
                            id:producerId, 
                            name:name, 
                            //parentId:parentProducerId, 
                            value:val, 
                            });   

                }, (1000 * index+1) + 500 ) ;
    
            })

            return () => {}
        }
        
    };
 
    marbles = rxmarbles.create();

    currentExample = marbles.startExample( shapes$ );

});