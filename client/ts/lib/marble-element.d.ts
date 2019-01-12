/** Simple Quick & Dirty marble visualizer, POJS no framework */
declare class RXMarbleDiagramElement extends HTMLElement {

    readonly maxNbrOfSamples:number;

    tickTime:number;

    pause:boolean;

    /**
     * 
     */
    clear():void;

   /**
     * 
     */
    start():void;
}
    


