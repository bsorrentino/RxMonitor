parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"PvU5":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.watch=void 0;var r=function(){return performance?performance.now():Date.now()},i=function(){function t(){e(this,t),this._ids={}}return n(t,[{key:"reset",value:function(){this._ids={}}},{key:"getName",value:function(e){return void 0===this._ids[e]?(this._ids[e]=0,e):e+String(++this._ids[e])}}]),t}(),o=new i;function a(e,t){return t||o.reset(),function(n){return n.lift(function(n){n.subscribe(c(this,t||e,t?e:void 0));return function(){}})}}function c(e,t,n){console.debug("subscribe( id='".concat(t,"', parentId='").concat(n,"' )"));var i=o.getName(t),a={type:"start",time:r(),id:i,parentId:n,name:i,createdByValue:!0,isIntermediate:!1};return window.dispatchEvent(new CustomEvent("rxmarbles.event",{detail:a})),{next:function(o){e.next(o);var a={type:"value",time:r(),id:i,parentId:n,name:i,value:o};console.debug("next( id='".concat(t,"', parentId='").concat(n,"' )")),window.dispatchEvent(new CustomEvent("rxmarbles.event",{detail:a}))},error:function(o){e.error(o);var a={type:"error",time:r(),id:i,parentId:n,name:i,err:o};console.error("next( id='".concat(t,"', parentId='").concat(n,"' )")),window.dispatchEvent(new CustomEvent("rxmarbles.event",{detail:a}))},complete:function(){e.complete();var o={type:"complete",time:r(),id:i,parentId:n,name:i};console.debug("complete( id='".concat(t,"', parentId='").concat(n,"' )")),window.dispatchEvent(new CustomEvent("rxmarbles.event",{detail:o}))}}}exports.watch=a;
},{}]},{},["PvU5"], null)
//# sourceMappingURL=/index.js.map