FROM node:10

COPY rxmonitor-server-1.0.0.tgz /tmp

RUN tar -xvzf /tmp/rxmonitor-server-1.0.0.tgz -C /home && \
    cd /home/package && \
    npm i

WORKDIR /home/package

ENTRYPOINT ["node", "index.js"]
