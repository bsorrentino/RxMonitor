/** Simple Quick & Dirty marble visualizer, POJS no framework */
function showMarbles(div, samples$, options) {
    var _a = (options || {}).maxNbrOfSamples, maxNbrOfSamples = _a === void 0 ? 50 : _a;
    var nbrOfSamplesReceived = 0;
    function createTable() {
        var tableEl = document.createElement('table');
        tableEl.classList.add('marble');
        return tableEl;
    }
    ;
    // Used Table to make sure vertical alignment stays OK when using special UTF8 symbols
    var tableEl = createTable();
    div.appendChild(tableEl);
    function clear() {
        while (tableEl.firstChild) {
            tableEl.removeChild(tableEl.firstChild);
        }
        nbrOfSamplesReceived = 0;
    }
    // Group row related functons
    var rows = {
        generateRowId: function generateRowId(id) {
            return 'marble__row-' + id;
        },
        createRow: function createRow(id, name, isIntermediate, childOrParentId) {
            // Row
            var rowEl = document.createElement('tr');
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
            var nameEl = document.createElement('td');
            nameEl.classList.add('marble__name');
            nameEl.setAttribute('title', 'stream name');
            if (name)
                nameEl.innerText = "- " + name;
            rowEl.appendChild(nameEl);
            // Nbr of Values
            var nbrOfValuesEl = document.createElement('td');
            if (!isIntermediate) {
                nbrOfValuesEl.classList.add('marble__nbr-of-values');
                nbrOfValuesEl.setAttribute('title', 'Number of values pushed');
            }
            rowEl.appendChild(nbrOfValuesEl);
            // Add Blanks to current location
            for (var i = 0; i < Math.min(nbrOfSamplesReceived, maxNbrOfSamples); i++) {
                var cellEl = createCell('');
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
        highlightRows: function highlightRows(rowIds) {
            var rowElIds = rowIds.map(function (id) { return rows.generateRowId(id); });
            rows.getRows().forEach(function (rowEl) {
                if (rowElIds.includes(rowEl.id)) {
                    rowEl.classList.add("marble__row-highlight");
                }
                else {
                    rowEl.classList.remove("marble__row-highlight");
                }
            });
        },
        highlightParentRows: function highlightRows(rowIds) {
            var rowElIds = rowIds.map(function (id) { return rows.generateRowId(id); });
            rows.getRows().forEach(function (rowEl) {
                if (rowElIds.includes(rowEl.id)) {
                    rowEl.classList.add("marble__row-parent");
                }
                else {
                    rowEl.classList.remove("marble__row-parent");
                }
            });
        },
        removeRow: function removeRow(rowEl) {
            tableEl.removeChild(rowEl);
        },
        getRow: function getRow(id) {
            return document.getElementById(rows.generateRowId(id));
        },
        getRows: function getRows() {
            return Array.from(tableEl.children);
        },
        isRowEmpty: function isRowEmpty(rowEl) {
            // TODO: optimize
            return Array.from(rowEl.children).slice(2).every(function (tdEl) { return tdEl.innerText === ''; });
        },
        getRowEnded: function getRowEnded(rowEl) {
            return !!rowEl.getAttribute('data-has-ended');
        },
        setRowEnded: function setRowEnded(rowEl, isEnded) {
            if (isEnded === void 0) { isEnded = true; }
            rowEl.setAttribute('data-has-ended', isEnded ? '1' : '');
        },
        findFreeForParent: function findFreeForParent(parentId) {
            return rows.getRows()
                .filter(function (rowEl) { return rowEl.getAttribute('data-parent-id') === parentId && rows.getRowEnded(rowEl); });
        },
        getIdsVisible: function getIdsVisible() {
            return rows.getRows()
                .map(function (rowEl) { return rowEl.getAttribute('data-id') || ''; })
                .filter(function (id) { return !!id; });
        },
        createAndInsertRow: function inserRow(sampleItem) {
            var ids = rows.getIdsVisible();
            var findRow = function (findId) {
                var index = ids.indexOf(findId);
                return index >= 0
                    ? tableEl.children[index]
                    : undefined;
            };
            var findParent = function (findParentOfId) {
                var children = ids
                    .filter(function (id) { return id.indexOf(findParentOfId + '-') === 0; });
                var depths = children.map(function (id) { return id.split('-').length; });
                var smallestDepth = Infinity;
                var firstAndClosestChildIndex = -1;
                depths.forEach(function (depth, index) {
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
            var childRow = findRow(sampleItem.parentId);
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
    var cols = {
        selectedColumn: -1,
        highlightColumn: function (columnIndex) {
            var rows = Array.from(tableEl.children);
            if (columnIndex === undefined || cols.selectedColumn !== columnIndex) {
                var highlightColumnIndex_1 = columnIndex === undefined ? cols.selectedColumn : columnIndex;
                var lastCellIndex = rows[0].lastChild.cellIndex;
                if (cols.selectedColumn >= 0 && cols.selectedColumn <= lastCellIndex) {
                    rows.forEach(function (row) { return row.children[cols.selectedColumn].classList.remove('marble__sample-highlight'); });
                }
                if (highlightColumnIndex_1 >= 0 && highlightColumnIndex_1 <= lastCellIndex) {
                    rows.forEach(function (row) { return row.children[highlightColumnIndex_1].classList.add('marble__sample-highlight'); });
                }
                cols.selectedColumn = highlightColumnIndex_1;
            }
        }
    };
    function toText(item) {
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
    function createCell(text, details) {
        var sampleEl = document.createElement('td');
        sampleEl.classList.add('marble__sample');
        sampleEl.innerText = text;
        if (details)
            sampleEl.title = details;
        return sampleEl;
    }
    function sampleItemToTooltip(info) {
        if (SamplerLogger.isValueSampleItem(info))
            return "Value: " + toText(info.value);
        if (SamplerLogger.isErrorSampleItem(info))
            return "Error: " + toText(info.err);
        if (SamplerLogger.isStartSampleItem(info))
            return ''; // `Subscribed`; // Disabled for easier colored line
        if (SamplerLogger.isCompleteSampleItem(info))
            return "Completed";
        if (SamplerLogger.isStopSampleItem(info))
            return "Unsubscribe";
        console.error('Unknown Sample Object', info);
        return '';
    }
    function sampleToTooltip(sample) {
        if (!sample)
            return '';
        return sample.reverse().map(function (sampleItem) { return sampleItemToTooltip(sampleItem); }).join('\n');
    }
    function getSampleInfo(sample) {
        function getValue(value) {
            if (typeof value === 'string')
                return value; // truncate?
            if (typeof value === 'boolean')
                return value ? '☑' : '☒';
            if (typeof value === 'number')
                return value.toString();
            if (Array.isArray(value))
                return "[" + value.map(function (v) { return getValue(v); }).join(',') + "]";
            return '?';
        }
        function getText() {
            if (!sample || sample.length === 0)
                return '───────'; // Multiple lines added for wide columns and clipped with CSS
            if (sample.length === 1) {
                var info = sample[0];
                if (SamplerLogger.isValueSampleItem(info))
                    return getValue(info.value);
                if (SamplerLogger.isStartSampleItem(info))
                    return info.createdByValue ? '╰──────' : '───────'; // Multiple lines added for wide columns and clipped with CSS
                if (SamplerLogger.isErrorSampleItem(info))
                    return '✖';
                if (SamplerLogger.isCompleteSampleItem(info))
                    return '┤';
                if (SamplerLogger.isStopSampleItem(info))
                    return '╴';
                console.error('Unknown Sample Object', info);
                return '?';
            }
            else {
                // Start and Stop
                if (sample.length >= 2 &&
                    sample[0].id === sample[1].id &&
                    !sample.some(function (info) { return SamplerLogger.isValueSampleItem(info) || SamplerLogger.isErrorSampleItem(info); }) &&
                    sample.some(function (info) { return SamplerLogger.isCompleteSampleItem(info); })) {
                    return '┤';
                }
                var valueInfos = sample.filter(function (info) { return SamplerLogger.isValueSampleItem(info); });
                var errorInfos = sample.filter(function (info) { return SamplerLogger.isErrorSampleItem(info); });
                // If one Error and No Value
                if (errorInfos.length === 1 && valueInfos.length === 0)
                    return '✖';
                if (errorInfos.length === 0 && valueInfos.length === 1)
                    return getValue(valueInfos[0].value);
                return '#'; // Multiple items
            }
        }
        return {
            text: getText(),
            tooltip: sampleToTooltip(sample)
        };
    }
    /*
    
        function removeOldestColumn() {
            const rowEls = tableEl.children;
        }*/
    function addSampleForId(id, sample) {
        var rowEl = rows.getRow(id);
        if (rowEl) {
            if (!rows.getRowEnded(rowEl)) {
                // Add Cell
                var sampleItems = sample.filter(function (g) { return g.id === id; });
                var _a = getSampleInfo(sampleItems), text = _a.text, tooltip = _a.tooltip;
                var sampleEl = createCell(text, tooltip);
                rowEl.appendChild(sampleEl);
                // Update Counters
                if (!rowEl.getAttribute('data-parent-id')) {
                    updateNbrOfValues(rowEl, sampleItems.filter(function (info) { return SamplerLogger.isValueSampleItem(info); }).length);
                }
                // End Row
                var shouldEndRow = sampleItems.some(function (info) { return SamplerLogger.isStopSampleItem(info) || SamplerLogger.isCompleteSampleItem(info) || SamplerLogger.isErrorSampleItem(info); });
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
    function updateNbrOfValues(rowEl, offset, reset) {
        if (!reset && !offset)
            return;
        var cellEl = rowEl.firstChild.nextSibling;
        var value = reset ? 0 : parseInt(cellEl.innerText.substring(1), 10);
        cellEl.innerText = "#" + (value + offset);
    }
    function addSample(sample) {
        // Create required rows
        sample
            .reverse() // So first parents are created
            .forEach(function (sampleItem) {
            if (SamplerLogger.isStartSampleItem(sampleItem)) {
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
    samples$.subscribe(function (sample) {
        nbrOfSamplesReceived++;
        addSample(sample);
    });
    // Hover effect on column
    tableEl.addEventListener('mouseover', function (e) {
        var el = e.target;
        if (el && el.classList) {
            var rowEl = el.parentNode;
            // Cell
            if (el.classList.contains('marble__sample')) {
                var selectColumnIndex = Array.from(rowEl.children).indexOf(el);
                if (selectColumnIndex !== undefined) {
                    cols.highlightColumn(selectColumnIndex);
                }
            }
            var id_1 = rowEl.getAttribute('data-id') || '';
            var parentId = rowEl.getAttribute('data-parent-id') || '';
            if (parentId) {
                rows.highlightRows([id_1]);
                rows.highlightParentRows([parentId]);
            }
            else {
                var parentIds = rows.getRows()
                    .map(function (rowEl) {
                    var children = (rowEl.getAttribute('data-children') || '').split(',');
                    return children.includes(id_1) ? rowEl.getAttribute('data-id') || '' : '';
                })
                    .filter(function (id) { return !!id; });
                rows.highlightParentRows(parentIds);
                rows.highlightRows([id_1]);
            }
        }
    });
    tableEl.addEventListener('mouseout', function (e) {
        var el = e.target;
        if (el && el.classList) {
            if (el.classList.contains('marble__sample')) {
                cols.highlightColumn(-1);
            }
            rows.highlightParentRows([]);
            rows.highlightRows([]);
        }
    });
    return {
        clear: function () {
            clear();
        }
    };
}
//# sourceMappingURL=Marbles.js.map