var keyboot = require('../');
var boot = keyboot();
var elems = {
    sign: document.querySelector('#sign'),
    button: document.querySelector('#sign button'),
    txt: document.querySelector('#sign textarea'),
    result: document.querySelector('#sign .result')
};
elems.button.addEventListener('click', onclick);

function onclick () {
    var msg = elems.sign.querySelector('textarea').value;
    boot.sign(msg, function (err, res) {
        elems.sign.textContent = Buffer(res).toString('base64');
    });
}

boot.on('approve', function () { show(elems.sign) });
boot.on('revoke', function () { hide(elems.sign) });
boot.on('close', function () {
    hide(elems.sign);
    button.removeEventListener('click', onclick);
});

document.querySelector('#auth').appendChild(boot.element);

function show (e) { e.style.display = 'block' }
function hide (e) { e.style.display = 'none' }
