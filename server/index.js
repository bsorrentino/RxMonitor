"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = __importStar(require("redis"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const express = require("express");
const bodyParser = require("body-parser");
let clients = {}; // <- Keep a map of attached clients
const redis_options = {
    host: "redis",
};
let client_pub = redis.createClient(redis_options);
let redisPublisher = (event, data) => rxjs_1.Observable.create((o) => {
    console.log("pushing message ....", event, data);
    client_pub.publish(event, data, (err, value) => {
        if (err) {
            o.error(err);
            return;
        }
        console.log("message pushed ....", value);
        o.next(value);
        o.complete();
    });
});
let redisSubscription = (channel) => {
    let client_sub = redis.createClient(redis_options);
    let onMessage = rxjs_1.Observable.create((o) => {
        client_sub.subscribe(channel, (err, value) => {
            if (err) {
                o.error(err);
                return;
            }
            client_sub.on("message", (channel, message) => o.next(message));
        });
        return () => {
            console.log('unsubscribe');
            client_sub.unsubscribe(channel);
            client_sub.quit();
        };
    });
    return rxjs_1.fromEvent(client_sub, 'ready')
        .pipe(operators_1.switchMap(() => onMessage));
};
const redisSub = redisSubscription('rxmarble.event');
let subscription = redisSub.subscribe(message => {
    console.log("message received", message);
    for (var clientId in clients) {
        clients[clientId].write(message); // <- Push a message to a single attached client
    }
    ;
});
var clientSeq = 0;
express()
    .get('/events/', (req, res) => {
    req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
    const clientId = "client" + clientSeq++;
    clients[clientId] = res; // <- Add this client to those we consider "attached"
    req.on("close", () => delete clients[clientId]); // <- Remove this client when he disconnects
})
    .use(bodyParser.json())
    .post('/message', (req, res) => {
    let msg = req.body;
    // @todo validate json
    redisPublisher('rxmarble.event', JSON.stringify(msg))
        .subscribe(() => res.end());
})
    .listen(process.env.PORT || 8080);
/*
fromEvent( client_pub, 'ready')
    .pipe( switchMap( () =>
                interval( 1000 )
                .pipe( take(2) )
                .pipe( mergeMap( ( tick ) =>
                        redisPublisher( 'rxmarble.event', 'msg' + tick) ))))
            .subscribe( );
*/
