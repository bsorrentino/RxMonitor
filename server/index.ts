import * as redis from 'redis';
import {
    Observable,
    Observer,
    fromEvent,
    fromEventPattern,
    bindNodeCallback,
    interval,
    pipe,
} from 'rxjs';
import {
    switchMap,
    mergeMap,
    tap,
    take,
    finalize,
    publish,
} from 'rxjs/operators';

import express = require('express');
import bodyParser = require('body-parser');

type SSEClient =  {
    [clientId:string]:express.Response;
}

let clients:SSEClient = {}; // <- Keep a map of attached clients


const redis_options:redis.ClientOpts = {
    host: "redis",
    // port?: number;
    // path?: string;
    // url?: string;
    // parser?: string;
    // string_numbers?: boolean;
    // return_buffers?: boolean;
    // detect_buffers?: boolean;
    // socket_keepalive?: boolean;
    // no_ready_check?: boolean;
    // enable_offline_queue?: boolean;
    // retry_max_delay?: number;
    // connect_timeout?: number;
    // max_attempts?: number;
    // retry_unfulfilled_commands?: boolean;
    // auth_pass?: string;
    // password?: string;
    // db?: string | number;
    // family?: string;
    // rename_commands?: { [command: string]: string } | null;
    // tls?: any;
    // prefix?: string;
    // retry_strategy?: RetryStrategy;
}

let client_pub = redis.createClient( redis_options );

let redisPublisher = ( event:string, data:string ) =>
        Observable.create( (o:Observer<any>) => {

            console.log( "pushing message ....", event,  data );
            client_pub.publish( event, data, (err,value) => {
                if( err ) {
                    o.error( err );
                    return;
                }

                console.log( "message pushed ....", value );

                o.next( value );
                o.complete();
            })
        });

let redisSubscription = ( channel:string ):Observable<string> => {

        let client_sub = redis.createClient( redis_options );

        let onMessage = Observable.create( (o:Observer<string>) => {
            client_sub.subscribe( channel, (err, value ) =>  {
                if( err ) {
                    o.error( err );
                    return;
                }
                client_sub.on( "message", (channel, message ) => o.next( message ) );
            });
            return () => { 
                console.log( 'unsubscribe' );
                client_sub.unsubscribe( channel );
                client_sub.quit();
            }
        });

        return fromEvent( client_sub, 'ready')
            .pipe( switchMap( () => onMessage) )
            ;
    }

const  redisSub = redisSubscription( 'rxmarble.event');

let subscription = redisSub.subscribe( message => {
            console.log( "message received", message );
            for ( var clientId in clients) {
                clients[clientId].write(message); // <- Push a message to a single attached client
            };

});

var clientSeq = 0;

express()
.get( '/events/',  (req, res) => {

	req.socket.setTimeout(Number.MAX_VALUE);
	res.writeHead(200, {
		'Content-Type': 'text/event-stream', // <- Important headers
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
    res.write('\n');

    const clientId = "client" + clientSeq++;

    clients[clientId] = res; // <- Add this client to those we consider "attached"

    req.on("close", () => delete clients[clientId] ); // <- Remove this client when he disconnects

})
.use(bodyParser.json())
.post( '/message', (req, res) => {

    let msg = req.body;
    // @todo validate json

    redisPublisher( 'rxmarble.event', JSON.stringify(msg) )
        .subscribe( () => res.end() );
})
.listen( process.env.PORT || 8080);

/*
fromEvent( client_pub, 'ready')
    .pipe( switchMap( () =>
                interval( 1000 )
                .pipe( take(2) )
                .pipe( mergeMap( ( tick ) =>
                        redisPublisher( 'rxmarble.event', 'msg' + tick) ))))
            .subscribe( );
*/
