
namespace example {

export type ChildLogger = {
    start: () =>  void;
    value: (val:any) => void;
    error: (err:any) => void;
    complete: () => void;
    end: () => void;
};

export interface Observer  {
    next?:(( e:any ) => void);
    error?:(( e:any ) => void);
    complete?:(() => void);

    producerId?:string;
}
 
export class ObservableBase {

    static lastId:number = 1;

    static getProducerId() {
        return String(ObservableBase.lastId++);
    }

    /**
     * 
     * @param name 
     * @param isCreatedByValue 
     */
    constructor( public name:string, public isCreatedByValue:boolean = false) {

    }

   // Show inner stream created by a value (example: delay, switchMap)
   createChildLogger(producerId?:string, createdByValue:boolean = true):ChildLogger {
    let id = ObservableBase.getProducerId();
    var createdById = producerId || '';

    var isStopped = false;
    return {
        start: () =>  {
            //id:string, name:string, parentId:string, createdByValue:any, isIntermediate:an
            let event = new CustomEvent( "rxmarbles.start", { detail: 
                {   id:id, 
                    name:'', 
                    parentId:createdById, 
                    createdByValue:createdByValue, 
                    isIntermediate:true} 
                });
            window.dispatchEvent( event );
        },
        value: (val:any) => {

            let event = new CustomEvent( "rxmarbles.value", { detail: 
                {   id:id, 
                    name:'', 
                    parentId:createdById, 
                    value:val, 
                    } 
                });
            window.dispatchEvent( event );
    
        },
        error: (err:any) => {

            let event = new CustomEvent( "rxmarbles.value", { detail: 
                {   id:id, 
                    name:'', 
                    parentId:createdById, 
                    err:err, 
                    } 
                });
            window.dispatchEvent( event );

            if (!isStopped) {
                isStopped = true;
            }
        },
        complete: () => {

            let event = new CustomEvent( "rxmarbles.complete", { detail: 
                {   id:id, 
                    name:'', 
                    parentId:createdById
                    } 
                });
            window.dispatchEvent( event );

            if (!isStopped) {
                isStopped = true;
            }
        },
        end: () => {

            if (!isStopped) {
                isStopped = true;
            }

            let event = new CustomEvent( "rxmarbles.stop", { detail: 
                {   id:id, 
                    name:'', 
                    parentId:createdById
                    } 
                });
            window.dispatchEvent( event );
        }
    };
}

logAndSubscribeToObservable(observable?:Observable, observer?:Observer, producerId?:string, createdByValue:boolean = true) {
    if (observable && observable.subscribe) {
        var childLogger = this.createChildLogger(producerId, createdByValue);
        childLogger.start();
        var unsubscribe = observable.subscribe({
            next: (val) => {
                observer.next(val);
                childLogger.value(val);
            },
            error: (err) => {
                observer.error(err);
                childLogger.error(err);
            },
            complete: () => {
                observer.complete();
                childLogger.complete();
            }
        }, producerId);
        return  () => {
            unsubscribe();
            childLogger.end();
        };
    }
    return observable.subscribe(observer);
};

}

}