# keyboot-ui

keyboot sign-in browser interface

Use this package to sign in with [keyboot](https://keyboot.org) from your own
web application.

For extra security, consider serving your web application with
[hyperboot](http://hyperboot.org).

# example

``` js
var keyboot = require('keyboot');
var kbui = require('keyboot-ui');

var boot = kbui(keyboot, {
    permissions: [ 'fingerprint', 'sign', 'publicKey' ]
});
document.body.appendChild(boot.element);

boot.on('approve', function () {
    boot.sign('wow!', function (err, res) {
        document.body.innerHTML += Buffer(res).toString('base64');
    });
});
```

Check out the example directory and
[view an example in action](https://substack.neocities.org/keyboot_ui.html).

# methods

``` js
var kbui = require('keyboot-ui')
var keyboot = require('keyboot')
```

## var ui = kbui(keyboot, opts={}, cb)

Create a keyboot `ui` instance given a `keyboot` rpc function.

Optionally provide:

* `opts.permissions` - array of string permissions to request
* `opts.storage` - storage mechanism, default: localStorage. Turn off
persistence by passing in `false`.
* `opts.defaultURL` - default URL to show, for example `'https://keyboot.org'`

`cb(boot)` sets up a listener for the `'keyboot'` event.

## ui.fingerprint(cb)

`cb(err, id)` fires with the hash of the public key `id`

## ui.sign(msg, cb)

Sign a message `msg`. The result `cb(err, res)` fires with the `Uint8Array`
digest `res`.

## ui.publicKey(cb)

Read the public key with `cb(err, publicKey)`.

## ui.reset()

Close the RPC bridge and destroy the current session.

# properties

## ui.element

Root DOM element you can append to your web page

# events

## ui.on('pending', function () {})

When the request is pending approval, this event fires.

## ui.on('approve', function () {})

When a request is approved on the remote end, this event fires.

## ui.on('reject', function () {})

When access is rejected on the remote end, this event fires.

## ui.on('revoke', function () {})

When previously approved access is revoked, this event fires.

## ui.on('close', function () {})

When the user clicks "sign out", this event fires.

## ui.on('keyboot', function (boot) {})

Fires with the underlying keyboot rpc object when the rpc channel is established

# install

With [npm](https://npmjs.org) do:

```
npm install keyboot-ui
```

or fetch a UMD bundle from [browserify-cdn](http://wzrd.in/):

http://wzrd.in/standalone/keyboot-ui@latest

# license

MIT
