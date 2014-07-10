var DataConnection = require('rtc-data-connection'),
    EventEmitter = require('eemitter');

function SimpleDataConnection(relay, offer) {
    var dataConnection,
        me = this;

    this.dataConnection = new DataConnection();
    dataConnection = this.dataConnection;

    relay.on('answer', function (answer) {
        console.log(answer);
        dataConnection.setDescription(answer);
    });
    relay.on('candidate', function (candidate) {
        console.log(candidate);
        dataConnection.addCandidate(candidate);
    });

    dataConnection.on('offer', function (offer) {
        relay.emit('offer', offer);
    });
    dataConnection.on('answer', function (answer) {
        relay.emit('answer', answer);
    });
    dataConnection.on('candidate', function (candidate) {
        relay.emit('candidate', candidate);
    });
    dataConnection.on('message', function (data) {
        me._handleMessage(data);
    });
    dataConnection.on('open', function () {
        me.connected = true;
        me.emit('open');
    });
    dataConnection.on('close', function () {
        me.connected = false;
        me.emit('close');
    });

    if (offer) {
        // we already have an offer?
        dataConnection.setDescription(offer);
        dataConnection.createAnswer();
    } else {
        // create an offer
        dataConnection.createOffer();
    }
}
SimpleDataConnection.prototype = Object.create(EventEmitter.prototype);
SimpleDataConnection.prototype.constructor = SimpleDataConnection;
SimpleDataConnection.prototype.send = function () {
    if (typeof arguments[0] === 'string') {
        data = JSON.stringify({
            type: arguments[0],
            args: [].slice.call(arguments, 1)
        });
    } else {
        data = JSON.stringify({
            type: 'message',
            args: [].concat.call(arguments)
        });
    }

    this.dataConnection.send(data);
};
SimpleDataConnection.prototype._handleMessage = function (data) {
    try {
        data = JSON.parse(data);
    } catch (err) {
        this.emit('message', data);
        return;
    }
    this.emit.apply(this, [data.type].concat(data.args || []));
};

module.exports = SimpleDataConnection;
