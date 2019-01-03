declare const enum SampleItemType {
    Start, Value, Error, Complete, Stop
}

declare type SampleInfo = { 
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

declare interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

/** Simple Quick & Dirty marble visualizer, POJS no framework */
declare class RXMarbleDiagramElement extends HTMLElement {
    private samples;
    private tableEl;
    private nbrOfSamplesReceived;
    readonly maxNbrOfSamples: number;
    pause: boolean;
    constructor();
    connectedCallback(): void;
    attributesChangedCallback(attribute: string, oldval: any, newval: any): void;
    static readonly observedAttributes: string[];
    private getStyle;
    /**
     *
     */
    clear(): void;
    /**
     *
     * @param sampleFilter
     * @param tickTime
     */
    private getSamples;
    /**
     *
     * @param samples$
     */
    start(tickTime?: number): void;
}
