
namespace rxmarbles {

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

    private static _logger:SamplerLogger;
    static get logger() {
        return ObservableBase._logger;
    }
    static set logger(v:SamplerLogger) {
        //console.log( "SET LOGGER", v);
        ObservableBase._logger = v;
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

    let logger = ObservableBase.logger;

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
            if (logger) 
                logger.onValue(val, id, '', createdById);
        },
        error: (err:any) => {
            if (logger) {
                logger.onError(err, id, '', createdById);
                if (!isStopped) {
                    isStopped = true;
                }
            }
        },
        complete: () => {
            if (logger) {
                logger.onComplete(id, '', createdById);
                if (!isStopped) {
                    isStopped = true;
                }
            }
        },
        end: () => {
            if (logger && !isStopped) {
                isStopped = true;
                logger.onStop(id, '', createdById);
            }
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