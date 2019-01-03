/** Simple Quick & Dirty marble visualizer, POJS no framework */
declare type SampleInfo = {
    type: SampleItemType;
    time: number;
};
declare const enum SampleItemType {
    Start = 0,
    Value = 1,
    Error = 2,
    Complete = 3,
    Stop = 4
}
interface SampleBase {
    id: string;
    parentId?: string;
    name: string;
}
interface SampleStart extends SampleBase {
    createdByValue: boolean;
    isIntermediate: boolean;
}
declare type SampleStop = SampleBase;
declare type SampleComplete = SampleBase;
interface SampleValue extends SampleBase {
    value: any;
}
interface SampleError extends SampleBase {
    err: any;
}
interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}
declare class RXMarbleDiagramElement extends HTMLElement {
    readonly maxNbrOfSamples: number;

    /**
     *
     */
    clear(): void;
    /**
     *
     * @param samples$
     */
    start(sampleFilter: ((s: Sample) => boolean), tickTime?: number): void;
}
