
export type SampleItemType = 'start' | 'value' | 'error' | 'complete' | 'stop'


export type SampleInfo = { 
    type: SampleItemType;
    time:number;
}

export interface SampleBase {
    id: string,
    parentId?: string,
    name: string,
}
export interface SampleStart extends SampleBase {
    createdByValue: boolean,
    isIntermediate: boolean,

}
export type SampleStop = SampleBase;

export type SampleComplete = SampleBase;

export interface SampleValue extends SampleBase {
    value:any
}
export interface SampleError extends SampleBase {
    err:any
}

export interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

