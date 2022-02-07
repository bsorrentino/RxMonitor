
export declare type SampleItemType = 'start' | 'value' | 'error' | 'complete' | 'stop'

export declare type SampleInfo = { 
    type: SampleItemType;
    time:number;
}

export declare interface SampleBase {
    id: string,
    parentId?: string,
    name: string,
}
export declare interface SampleStart extends SampleBase {
    createdByValue: boolean,
    isIntermediate: boolean,

}
export declare type SampleStop = SampleBase;

export declare type SampleComplete = SampleBase;

export declare interface SampleValue extends SampleBase {
    value:any
}
export declare interface SampleError extends SampleBase {
    err:any
}

export declare interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

