const {curry}  = require('../../src/other-types/pointfree.js');

//delay :: Integer -> Promise null
const delay = ms => new Promise(resolve => global.setTimeout(resolve, ms));
const delayR = ms => new Promise((resolve, reject) => global.setTimeout(reject, ms));
//tapDelay :: Integer -> a -> Promise a
const tapDelay = curry((ms,x) => new Promise(resolve => global.setTimeout(resolve, ms, x)));
const tapDelayR = curry((ms,x) => new Promise((resolve, reject) => global.setTimeout(reject, ms, x)));

const log = x => !console.log(x) && x;
const andLog = (...comments) => x => !console.log(x, ...comments) && x;

const deriveMap = Applicative => function (fn) {
  return this.chain(value => Applicative.of(fn(value)) );
};

const deriveAp = Applicative => function(app2) {
  return this.chain(fn => app2.chain(app2value => Applicative.of(fn(app2value)) ) );
};

//write in-type monadic operations in do notation using generators
const doM = gen => {
    function step(value) {
        var result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.chain(step);
    }
    return step();
};

const add = curry((x,y) => x+y);
const increment = add(1);


/*
var result = doM(function*() {
    var value = yield Nothing;
    var value2 = yield Maybe.of(11);
    return value + value2;
}());
*/
//matches patterns of true/false
const booleanEquals = arr => arr2 => {
 return arr.reduce((acc, x, i)=> acc && x===arr2[i], true);
}
//http://goo.gl/wwqCtX

//we'll want some helper functions probably, because common DOM methods don't exactly work like Arrays. Nice example:
const getNodeChildren = node => Array.from(node.children);
const setHTML = stringHTML => node => IO(_=> Object.assign(node,{innerHTML:stringHTML}));
const setStyleProp = (propString, newValue) => node => IO(_ => { node.style[propString] = newValue; return node;});

//IO.$('input').map(compose(Maybe.fromNullable,head)).chain(compose( sequence(IO.of), map(setStyleProp('color','red')) )).runIO();

//compose(chain(traverse(setStyleProp('color','red'), IO.of)), map(Maybe.head), IO.$)
//Reader.ask.map(IO.$).map(map(Maybe.head)).map(chain(traverse(setStyleProp('color','red'), IO.of))).map(x=>x.runIO()).run
//document.addEventListener('click', compose(runIO, chain(setStyleProp('color','red')), IO.of, e=>e.target))


module.exports = {
  add,
  increment,
  delay,
  delayR,
  tapDelay,
  tapDelayR,
  log,
  andLog,
  deriveMap,
  deriveAp,
  doM,
  getNodeChildren,
  setHTML,
  setStyleProp,
  booleanEquals
};