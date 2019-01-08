"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
function _proxy_subscriber(tag, input) {
    return new Proxy(input, {
        get: (target, name, receiver) => {
            if (name in target) {
                switch (name) {
                    case 'next':
                    case 'error':
                        return (v) => {
                            console.log(tag, name, v);
                            target[name](v);
                        };
                    case 'complete':
                        return () => {
                            console.log(tag, name);
                            target[name]();
                        };
                    case 'remove':
                        return (v) => {
                            console.log(tag, name);
                            target[name](v);
                        };
                    default:
                        return target[name];
                }
            }
        }
    });
}
function _proxy_subscribe(tag, input) {
    return new Proxy(input, {
        apply: (target, thisArg, argArray) => {
            if (argArray && argArray.length == 1 && typeof (argArray[0]) == "object") {
                let args = [_proxy_subscriber(tag, argArray[0])];
                return target.apply(thisArg, args);
            }
            return target.apply(thisArg, argArray);
        }
    });
}
function _p(tag, input) {
    return new Proxy(input, {
        get: (target, name, receiver) => {
            if (name in target) {
                let result = target[name];
                if (name === "subscribe") {
                    return _proxy_subscribe(tag, result);
                }
                return result;
            }
        },
        apply: (target, thisArg, argArray) => {
            let result = target.apply(thisArg, argArray);
            return _p(tag, result);
        }
    });
}
_p("interval", rxjs_1.interval(1000))
    .pipe(_p("map", operators_1.map(e => e * 2)))
    .pipe(_p("take", operators_1.take(100)))
    .subscribe(t => console.log(t));
