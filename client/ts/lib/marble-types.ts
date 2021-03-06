
export const enum SampleItemType {
    Start, Value, Error, Complete, Stop
}

export type SampleInfo = { 
    type: SampleItemType;
    time:number;
}

declare interface SampleBase {
    id: string,
    parentId?: string,
    name: string,
}
declare interface SampleStart extends SampleBase {
    createdByValue: boolean,
    isIntermediate: boolean,

}
declare type SampleStop = SampleBase;

declare type SampleComplete = SampleBase;

declare interface SampleValue extends SampleBase {
    value:any
}
declare interface SampleError extends SampleBase {
    err:any
}

export interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

