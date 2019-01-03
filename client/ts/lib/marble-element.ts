/** Simple Quick & Dirty marble visualizer, POJS no framework */

import { Observable, Subject } from 'rxjs';
import { bufferTime, map, tap, filter, takeWhile } from 'rxjs/operators';

const enum SampleItemType {
    Start, Value, Error, Complete, Stop
}

type SampleInfo = { 
    type: SampleItemType;
    time:number;
}

interface SampleBase {
    id: string,
    parentId?: string,
    name: string,
}
interface SampleStart extends SampleBase {
    createdByValue: boolean,
    isIntermediate: boolean,

}
type SampleStop = SampleBase;

type SampleComplete = SampleBase;

interface SampleValue extends SampleBase {
    value:any
}
interface SampleError extends SampleBase {
    err:any
}

interface Sample extends SampleInfo, Partial<SampleStart>, Partial<SampleValue>, Partial<SampleError> {
}

const noneFilledShapes  = ['□', '△', '○', '▷', '☆'];
const filledShapes      = ['■', '▲', '●', '▶', '★'];


function isStart( info:SampleInfo  ) {
    return info && info.type === SampleItemType.Start;
}
function isValue(info:SampleInfo ) {
    return info && info.type === SampleItemType.Value;
};
function isError(info:SampleInfo ) {
    return info && info.type === SampleItemType.Error;
};
function isComplete(info:SampleInfo) {
    return info && info.type === SampleItemType.Complete;
};
function isStop(info:SampleInfo ) {
    return info && info.type === SampleItemType.Stop;
};   

const USE_SHADOW_DOM = true;
const PAUSE_ATTR = 'pause';

// @see
// https://dev.to/aspittel/building-web-components-with-vanilla-javascript--jho
// https://www.codementor.io/ayushgupta/vanilla-js-web-components-chguq8goz
export class RXMarbleDiagramElement extends HTMLElement {

    private samples = new Subject<Sample>();  

    private tableEl:HTMLTableElement;
    private nbrOfSamplesReceived = 0;

    get maxNbrOfSamples() {
        return Number(this.getAttribute('max-samples') || 50 );
    }

    get pause() {
        //console.log( "get pause", this.getAttribute(PAUSE_ATTR) );
        return this.getAttribute(PAUSE_ATTR)==='true';
    }

    set pause( v:boolean ) {
       //console.log( "set pause", String(v) );
       this.setAttribute(PAUSE_ATTR, String(v) );
    }

    constructor() {
        super();
    }

    connectedCallback () {
        const shadowRoot = (USE_SHADOW_DOM) ? 
            this.attachShadow({mode: 'open'}) :
            document.body;

        if( USE_SHADOW_DOM ) shadowRoot.appendChild( this.getStyle() );

        let createTable = () => {
            const tableEl = document.createElement('table');
            tableEl.classList.add('marble');
            return tableEl;
        }

        this.tableEl = createTable();
        shadowRoot.appendChild( this.tableEl );

        window.addEventListener( 'rxmarbles.event', (event:any) => {
            this.samples.next( event.detail );
        });
    }

    attributesChangedCallback(attribute:string, oldval:any, newval:any) {

        if( attribute === PAUSE_ATTR ) {
            console.log( "update pause", oldval, newval );
        }
    }
    
    static get observedAttributes() { return [PAUSE_ATTR]; }


    private getStyle() {
        const styleTag = document.createElement('style')
        styleTag.innerHTML = 
        `
        .marble {
            font-family: monospace;
            font-size: 18px;
            border-collapse: collapse;
            border-spacing: 0;
            margin: 1em 0 0 1em;
            cursor: default;
        }
        
        .marble__name {
            padding-right: 1em;
            white-space: nowrap;
        }
        
        .marble__nbr-of-values {
            padding-right: 0.5em;
            min-width: 38px;
        }
        
        .marble__sample {
            padding: 0; 
            text-align: left;
            cursor: default;
            min-width: 1em;
        }
        
        /* Line color */
        .marble__sample:not([title]) {
            color: #666666;
            max-width: 1em;
            overflow-x: hidden;
        }
        
        .marble__sample-highlight {
            background-color: #333333;
        }
        
        .marble__row {
            transition-property: color;
            transition-duration: 200ms;
        }
        
        .marble__row-parent {
            color: #bbf;
        }
        
        .marble__row-highlight {
            color: #88f;
            background-color: #282828;
        }
        `;
        
        return styleTag;
     
    }

    /**
     * 
     */
    public clear() {
        while (this.tableEl.firstChild) {
            this.tableEl.removeChild(this.tableEl.firstChild);
        }
        this.nbrOfSamplesReceived = 0;
    }

    /**
     * 
     * @param sampleFilter 
     * @param tickTime 
     */
    private getSamples( tickTime:number = 1000 ):Observable<Sample[]> {

        let sort = (a:SampleInfo,b:SampleInfo) => {
            let timeDiff = b.time - a.time ;
            if( timeDiff !== 0 ) return timeDiff;
            return b.type - a.type; 

        }

        return this.samples
                .pipe( takeWhile( sample => sample.type!=SampleItemType.Complete || sample.parentId!=undefined ) )
                .pipe( tap( sample => console.log( "filter", this.pause  )), filter( sample => this.pause===false ) )
                .pipe( bufferTime( tickTime ), map( s => s.sort( sort ) ))
                ;
    }

    /**
     * 
     * @param samples$ 
     */
    public start(  tickTime:number = 1000 ) {
        
        const shadowRoot = (USE_SHADOW_DOM) ?  this.shadowRoot : document;

        const maxNbrOfSamples =  this.maxNbrOfSamples; 

        const tableEl = this.tableEl;

        // Group row related functons
        const rows = {
            generateRowId: (id:any) => 'marble__row-' + id,
            createRow: (id:any, name:any, isIntermediate:any, childOrParentId:any) => {
                // Row
                const rowEl = document.createElement('tr');
                rowEl.classList.add('marble__row');
                rowEl.id = rows.generateRowId(id);
                rowEl.setAttribute('data-id', id);
                if (name)
                    rowEl.setAttribute('data-name', name);
                if (isIntermediate) {
                    rowEl.setAttribute('data-parent-id', childOrParentId || '');
                }
                else {
                    if (childOrParentId)
                        rowEl.setAttribute('data-children', childOrParentId);
                }
                // Name
                const nameEl = document.createElement('td');
                nameEl.classList.add('marble__name');
                nameEl.setAttribute('title', 'stream name');
                if (name)
                    nameEl.innerText = "- " + name;
                rowEl.appendChild(nameEl);
                // Nbr of Values
                let nbrOfValuesEl = document.createElement('td');
                if (!isIntermediate) {
                    nbrOfValuesEl.classList.add('marble__nbr-of-values');
                    nbrOfValuesEl.setAttribute('title', 'Number of values pushed');
                }
                rowEl.appendChild(nbrOfValuesEl);
                // Add Blanks to current location
                for (var i = 0; i < Math.min(this.nbrOfSamplesReceived, maxNbrOfSamples); i++) {
                    let cellEl = createCell('');
                    // HightLight?
                    if (cols.selectedColumn >= 0 && i + 2 === cols.selectedColumn) {
                        if (cellEl.classList)
                            cellEl.classList.add('marble__sample-highlight');
                    }
                    rowEl.appendChild(cellEl);
                }
                if (!isIntermediate) {
                    updateNbrOfValues(rowEl, 0, true);
                }
                return rowEl;
            },
            highlightRows: (rowIds:any) => {
                var rowElIds = rowIds.map( (id:any) => rows.generateRowId(id) );
                rows.getRows().forEach( rowEl => {
                    if (rowElIds.includes(rowEl.id)) {
                        rowEl.classList.add("marble__row-highlight");
                    }
                    else {
                        rowEl.classList.remove("marble__row-highlight");
                    }
                });
            },
            highlightParentRows: (rowIds:any) => {
                var rowElIds = rowIds.map(function (id:any) { return rows.generateRowId(id); });
                rows.getRows().forEach(function (rowEl) {
                    if (rowElIds.includes(rowEl.id)) {
                        rowEl.classList.add("marble__row-parent");
                    }
                    else {
                        rowEl.classList.remove("marble__row-parent");
                    }
                });
            },
            removeRow:      (rowEl:any) => tableEl.removeChild(rowEl),

            getRow:         (id:any) => shadowRoot.getElementById(rows.generateRowId(id)) as HTMLTableRowElement,

            getRows:        () => Array.from(tableEl.children) as Array<HTMLTableRowElement>,

            isRowEmpty:     (rowEl:HTMLElement) => Array.from(rowEl.children).slice(2).every( tdEl => (<HTMLElement>tdEl).innerText === '' ),

            getRowEnded:    (rowEl:any) => !!rowEl.getAttribute('data-has-ended'),

            setRowEnded: (rowEl:any, isEnded = true) => rowEl.setAttribute('data-has-ended', isEnded ? '1' : ''),

            findFreeForParent: (parentId:any) => 
                                        rows.getRows()
                                        .filter(rowEl => rowEl.getAttribute('data-parent-id') === parentId && rows.getRowEnded(rowEl) ),

            getIdsVisible: () => 
                            rows.getRows()
                            .map( rowEl =>  rowEl.getAttribute('data-id') || '' )
                            .filter( id => !!id ),

            createAndInsertRow: (sampleItem:any) => {
                let ids = rows.getIdsVisible();
                let findRow = (findId:string) => {
                    var index = ids.indexOf(findId);
                    return index >= 0
                        ? tableEl.children[index]
                        : undefined;
                };
                let findParent = (findParentOfId:any) => {
                    let children = ids
                        .filter(function (id) { return id.indexOf(findParentOfId + '-') === 0; });
                    let depths = children.map(function (id) { return id.split('-').length; });
                    let smallestDepth = Infinity;
                    let firstAndClosestChildIndex = -1;
                    depths.forEach( (depth, index) => {
                        if (depth < smallestDepth) {
                            smallestDepth = depth;
                            firstAndClosestChildIndex = index;
                        }
                    });
                    if (firstAndClosestChildIndex >= 0) {
                        var childId = children[firstAndClosestChildIndex];
                        return rows.getRow(childId);
                    }
                    return undefined;
                };
                let childRow = findRow(sampleItem.parentId);
                if (childRow) {
                    if (sampleItem.isIntermediate) {
                        // Insert After
                        var freeRow = rows.findFreeForParent(sampleItem.parentId)[0];
                        if (freeRow) {
                            freeRow.id = rows.generateRowId(sampleItem.id);
                            freeRow.setAttribute('data-id', sampleItem.id);
                            freeRow.removeAttribute('data-children');
                            rows.setRowEnded(freeRow, false);
                            return freeRow;
                        }
                        else {
                            var rowEl = rows.createRow(sampleItem.id, sampleItem.name, sampleItem.isIntermediate, sampleItem.parentId);
                            rows.setRowEnded(rowEl, false);
                            childRow.parentNode.insertBefore(rowEl, childRow);
                            return rowEl;
                        }
                    }
                    else {
                        // Insert Before
                        var rowEl = rows.createRow(sampleItem.id, sampleItem.name, sampleItem.isIntermediate, sampleItem.parentId);
                        //childRow.parentNode!.insertBefore(rowEl, childRow);
                        childRow.parentNode.appendChild(rowEl);
                        return rowEl;
                    }
                }
                else {
                    var closestChild = findParent(sampleItem.id);
                    var rowEl = rows.createRow(sampleItem.id, sampleItem.name, sampleItem.isIntermediate, sampleItem.parentId);
                    if (closestChild) {
                        tableEl.insertBefore(rowEl, closestChild); // Add before
                    }
                    else {
                        tableEl.appendChild(rowEl);
                    }
                    return rowEl;
                }
            }
        };
        let cols = {
            selectedColumn: -1,
            highlightColumn:  (columnIndex:any) => {
                let rows = Array.from(tableEl.children);
                if (columnIndex === undefined || cols.selectedColumn !== columnIndex) {
                    let highlightColumnIndex_1 = columnIndex === undefined ? cols.selectedColumn : columnIndex;
                    let lastCellIndex = (<HTMLTableCellElement>rows[0].lastChild).cellIndex;
                    if (cols.selectedColumn >= 0 && cols.selectedColumn <= lastCellIndex) {
                        rows.forEach( row =>  row.children[cols.selectedColumn].classList.remove('marble__sample-highlight') );
                    }
                    if (highlightColumnIndex_1 >= 0 && highlightColumnIndex_1 <= lastCellIndex) {
                        rows.forEach( row =>  row.children[highlightColumnIndex_1].classList.add('marble__sample-highlight') );
                    }
                    cols.selectedColumn = highlightColumnIndex_1;
                }
            }
        };
        function toText(item:any) {
            if (item === null)
                return "<null>";
            if (item === undefined)
                return "<undefined>";
            if (typeof item === 'string')
                return item;
            if (typeof item === 'number')
                return item.toString();
            if (typeof item === 'boolean')
                return item.toString();
            //if (Array.isArray(item)) return "<Array>";
            return item.toString();
        }
        function createCell(text:any, details?:any) {
            var sampleEl = document.createElement('td');
            sampleEl.classList.add('marble__sample');
            sampleEl.innerText = text;
            if (details)
                sampleEl.title = details;
            return sampleEl;
        }
        function sampleItemToTooltip(info:Sample) {
            if (isValue(info))
                return "Value: " + toText(info.value);
            if (isError(info))
                return "Error: " + toText(info.err);
            if (isStart(info))
                return ''; // `Subscribed`; // Disabled for easier colored line
            if (isComplete(info))
                return "Completed";
            if (isStop(info))
                return "Unsubscribe";
            console.error('Unknown Sample Object', info);
            return '';
        }
        function sampleToTooltip(sample:Array<Sample>) {
            if (!sample)
                return '';
            return sample.reverse().map( sampleItem => sampleItemToTooltip(sampleItem) ).join('\n');
        }
        function getSampleInfo(sample:Array<Sample>) {
    
            function getValue(value:any):any {
                if (typeof value === 'string')
                    return value; // truncate?
                if (typeof value === 'boolean')
                    return value ? '☑' : '☒';
                if (typeof value === 'number')
                    return value.toString();
                if (Array.isArray(value))
                    return "[" + value.map( (v) => getValue(v) ).join(',') + "]";
                return '?';
            }
            function getText() {
                if (!sample || sample.length === 0)
                    return '───────'; // Multiple lines added for wide columns and clipped with CSS
    
                    return sample.map( e => _getText(e) ).join('');
    
                function _getText( info:Sample ) {
                    
                    if (isValue(info))
                        return getValue(info.value);
                    if (isStart(info))
                        return info.createdByValue ? '╰──────' : '───────'; // Multiple lines added for wide columns and clipped with CSS
                    if (isError(info))
                        return '✖';
                    if (isComplete(info))
                        return '┤';
                    if (isStop(info))
                        return '╴';
                    console.error('Unknown Sample Object', info);
                    return '?';
    
                }
            }
            return {
                text: getText(),
                tooltip: sampleToTooltip(sample)
            };
        }

        function addSampleForId(id:any, sample:Array<any>) {
            var rowEl = rows.getRow(id);
            if (rowEl) {
                if (!rows.getRowEnded(rowEl)) {
                    // Add Cell
                    var sampleItems = sample.filter( g => g.id === id );
                    var _a = getSampleInfo(sampleItems), text = _a.text, tooltip = _a.tooltip;
                    var sampleEl = createCell(text, tooltip);
                    rowEl.appendChild(sampleEl);
                    // Update Counters
                    if (!rowEl.getAttribute('data-parent-id')) {
                        updateNbrOfValues(rowEl, sampleItems.filter( (info:SampleInfo) => isValue(info)).length);
                    }
                    // End Row
                    var shouldEndRow = sampleItems.some( (info:SampleInfo) => isStop(info) || isComplete(info) || isError(info) );
                    if (shouldEndRow)
                        rows.setRowEnded(rowEl, true);
                }
                else {
                    // ended stream
                    var sampleEl = createCell(' ', undefined);
                    rowEl.appendChild(sampleEl);
                }
            }
            else {
                console.error("Row with id: '" + id + "' not found.");
            }
        }
        /** ensure max length not exceeded */
        function ensureMaxWidth() {
            for (var rowIndex = 0; rowIndex < tableEl.children.length; rowIndex++) {
                var rowEl = tableEl.children[rowIndex];
                while (rowEl.children.length > maxNbrOfSamples) {
                    var deleteEl = rowEl.firstChild.nextSibling.nextSibling.nextSibling;
                    rowEl.removeChild(deleteEl);
                    // Correct selection
                    cols.selectedColumn = cols.selectedColumn - 1; // So unhighlight possible
                    cols.highlightColumn(cols.selectedColumn + 1);
                }
            }
        }
        function updateNbrOfValues(rowEl:any, offset:any, reset?:any) {
            if (!reset && !offset)
                return;
            var cellEl = rowEl.firstChild.nextSibling;
            var value = reset ? 0 : parseInt(cellEl.innerText.substring(1), 10);
            cellEl.innerText = "#" + (value + offset);
        }
        function addSample(sample:Array<any>) {
            // Create required rows
            sample
                .reverse() // So first parents are created
                .forEach((sampleItem) => {
                    if (isStart(sampleItem)) {
                        // Add
                        if (!rows.getRow(sampleItem.id)) {
                            rows.createAndInsertRow(sampleItem);
                        }
                    }
                });
            // Scroll effect
            ensureMaxWidth();
            // Process per id
            var ids = rows.getIdsVisible();
            ids.forEach(function (id) {
                addSampleForId(id, sample);
            });
            // Cleanup empty rows
            rows.getRows().forEach(function (rowEl) {
                var isRowEmpty = rows.isRowEmpty(rowEl);
                if (isRowEmpty)
                    rows.removeRow(rowEl);
            });
        }

        this.clear();
        
        this.getSamples( tickTime )
                .subscribe( { 
                    next: (sample:any) => {
                        this.nbrOfSamplesReceived++;
                        addSample(sample);
                    }
                });
    
        // Hover effect on column
        tableEl.addEventListener('mouseover',  (e:Event) => {
            let el = e.target as Element;
            if (el && el.classList) {
                let rowEl = el.parentNode as Element;
                // Cell
                if (el.classList.contains('marble__sample')) {
                    var selectColumnIndex = Array.from(rowEl.children).indexOf(el);
                    if (selectColumnIndex !== undefined) {
                        cols.highlightColumn(selectColumnIndex);
                    }
                }
                let id_1 = rowEl.getAttribute('data-id') || '';
                let parentId = rowEl.getAttribute('data-parent-id') || '';
                if (parentId) {
                    rows.highlightRows([id_1]);
                    rows.highlightParentRows([parentId]);
                }
                else {
                    let parentIds = rows.getRows()
                        .map( rowEl => {
                            let children = (rowEl.getAttribute('data-children') || '').split(',');
                            return children.includes(id_1) ? rowEl.getAttribute('data-id') || '' : '';
                        })
                        .filter(function (id) { return !!id; })
                        ;
                    rows.highlightParentRows(parentIds);
                    rows.highlightRows([id_1]);
                }
            }
        });
        tableEl.addEventListener('mouseout',  (e) => {
            let el = e.target as Element;
            if (el && el.classList) {
                if (el.classList.contains('marble__sample')) {
                    cols.highlightColumn(-1);
                }
                rows.highlightParentRows([]);
                rows.highlightRows([]);
            }
        });
    
    }
}

try {

    customElements.define('rxmarble-diagram', RXMarbleDiagramElement);

} catch (err) {
    console.error( err );
    /*
    const h3 = document.createElement('h3')
    h3.innerHTML = "This site uses webcomponents which don't work in all browsers! Try this site in a browser that supports them!"
    document.body.appendChild(h3);
    */
}
    


