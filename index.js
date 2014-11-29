var inherits = require('inherits');
var defined = require('defined');
var EventEmitter = require('events').EventEmitter;

var fs = require('fs');
var html = fs.readFileSync(__dirname + '/static/ui.html', 'utf8');

module.exports = UI;
inherits(UI, EventEmitter);

function UI (keyboot, opts) {
    if (!(this instanceof UI)) return new UI(keyboot, opts);
    EventEmitter.call(this);
    var self = this;
    
    if (!opts) opts = {};
    this._waiting = [];
    this._storage = defined(opts.storage, localStorage);
    this._keyboot = keyboot;
    
    this.element = dom(html);
    this._elems = {
        link: this.element.querySelector('*[state=pending] a'),
        fingerprint: this.element.querySelector('.keyboot-ui-fingerprint')
    };
    
    var states = this.element.querySelectorAll('*[state]');
    this._states = {};
    for (var i = 0; i < states.length; i++) (function (state) {
        self._states[state.getAttribute('state')] = state;
        hide(state);
    })(states[i]);
    
    var links = this.element.querySelectorAll('*[link]');
    for (var i = 0; i < links.length; i++) (function (link) {
        link.addEventListener('click', function (ev) {
            self._show(link);
        });
    })(links[i]);
    
    this.on('transition', function (prev, cur) {
        if (cur === 'sign-in') self.reset();
        if (cur === 'pending') {
            self._elems.link.textContent = self._url;
            self._elems.link.setAttribute('href', self._url);
        }
    });
    
    var form = this.element.querySelector('form');
    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        self.request(form.elements.url.value, opts);
    });
    
    this.on('pending', function () { self._show('pending') });
    this.on('approve', function () { self._show('approved') });
    this.on('rejected', function () { self._show('rejected') });
    
    if (this._storage) {
        var sprev = this._storage.getItem('keyboot-ui!prev');
        if (sprev) {
            try { var prev = JSON.parse(sprev) }
            catch (err) {}
        }
        if (prev) this.request(prev.url, prev.options);
        else this._show('sign-in');
        
        this.on('close', onclose);
        this.on('revoke', onclose);
        this.on('reject', onclose);
    }
    else this._show('sign-in');
    
    function onclose () {
        self._storage.removeItem('keyboot-ui!prev');
    }
}

UI.prototype._show = function (state) {
    if (this._state) hide(this._states[this._state]);
    show(this._states[state]);
    this.emit('transition', this._state, state);
    this._state = state;
};

UI.prototype.request = function (url, opts) {
    this._url = url;
    this.rpc = this._keyboot(url, opts);
    this.rpc.on('pending', this.emit.bind(this, 'pending'));
    this.rpc.on('approve', this.emit.bind(this, 'approve'));
    this.rpc.on('reject', this.emit.bind(this, 'reject'));
    this.rpc.on('revoke', this.emit.bind(this, 'revoke'));
    this.rpc.on('close', this.emit.bind(this, 'close'));
    
    var prev = { url: url, options: opts };
    var sprev = JSON.stringify(prev);
    if (this._storage) this._storage.setItem('keyboot-ui!prev', sprev);
};

UI.prototype.reset = function () {
    if (this.rpc) this.rpc.close();
    this.rpc = null;
};

[ 'sign', 'fingerprint', 'publicKey' ].forEach(function (name) {
    UI.prototype[name] = defer(function () {
        this.rpc[name].apply(this.rpc, arguments);
    });
});

function defer (fn) {
    return function () {
        var self = this;
        if (self.rpc) return fn.apply(self, arguments);
        var args = arguments;
        self._waiting.push(f);
        self.once('approve', f);
        
        function f () {
            var ix = self._waiting.indexOf(f);
            if (ix >= 0) self._waiting.splice(ix, 1);
            fn.apply(self, args);
        }
    };
}

function dom (s) {
    var div = document.createElement('div');
    div.innerHTML = s;
    return div;
}

function hide (e) { e.style.display = 'none' }
function show (e) { e.style.display = 'block' }
