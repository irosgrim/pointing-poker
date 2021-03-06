const app = new Vue({
    el: '#app',
    data: function () {
        return {
            socket: null,
            name: 'Ion',
            hello: '',
        }
    },
    created: function () {
        const name = ('?name=' + this.name) || '';
        let dateNow = Date.now();
        this.socket = new Ws(`ws://localhost:8000` + name);
        this.socket.listen('joined', (data) => {
            this.hello = data.message;
        }).listen('pong', (data) => {
            console.log('ping response took ' + (data.dateNow - dateNow) + 'ms')
        });
        this.socket.send('ping', { message: 'ping request', dateNow: Date.now() });
    }
})

function Ws(url) {
    let wsClient = new WebSocket(url);
    const wsConnection = new Promise((resolve, reject) => {

        wsClient.onopen = () => {
            resolve(wsClient);
        };

        wsClient.onerror = (error) => {
            reject(error);
        }
    });

    let callbacks = {};

    const dispatch = function (eventName, message) {
        let chain = callbacks[eventName];
        if (typeof chain === 'undefined') {
            return;
        }
        for (let i = 0; i < chain.length; i++) {
            chain[i](message);
        }
    }

    this.listen = function (event_name, callback) {
        callbacks[event_name] = callbacks[event_name] || [];
        callbacks[event_name].push(callback);
        return this;
    };

    this.send = async function (event, eventData) {
        let payload = JSON.stringify({ event: event, data: eventData });
        let ws = await wsConnection;
        ws.send(payload)
    }

    this.onmessage = async function () {
        let ws = await wsConnection;
        ws.onmessage = (event) => {
            let payload = JSON.parse(event.data);
            dispatch(payload.event, payload.data);
        }
    }();

    this.onclose = async function () {
        let ws = await wsConnection;
        ws.onclose = () => {
            dispatch('close', null);
        }
    }();
}