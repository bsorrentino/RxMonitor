declare type action<T> = (e: T) => void;
interface Observable {
    subscribe(p: {
        next: action<any>;
        error?: action<any>;
        complete?: action<any>;
    }): any;
}
declare var Observable: {
    new (subscribe: any): Observable;
};
declare type Info = {
    type: SampleItemType;
};
declare enum SampleItemType {
    Start = 0,
    Value = 1,
    Error = 2,
    Complete = 3,
    Stop = 4
}
interface Sample {
    type: SampleItemType;
    id: string;
    parentId: string;
    name: string;
    err?: any;
    value?: any;
    createdByValue?: any;
    isIntermediate?: any;
}
declare class SamplerLogger {
    private ticker;
    lastSample: Array<Sample>;
    constructor(ticker: Observable);
    static isStartSampleItem(info: Info): boolean;
    static isValueSampleItem(info: Info): boolean;
    static isErrorSampleItem(info: Info): boolean;
    static isCompleteSampleItem(info: Info): boolean;
    static isStopSampleItem(info: Info): boolean;
    getSample(): Sample[];
    getSamples(): Observable;
    onStart(id: string, name: string, parentId: string, createdByValue: any, isIntermediate: any): void;
    onValue(value: any, id: string, name: string, parentId: string): void;
    onError(err: any, id: string, name: string, parentId: string): void;
    onComplete(id: string, name: string, parentId: string): void;
    onStop(id: string, name: string, parentId: string): void;
}
