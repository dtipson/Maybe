const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));
const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const ap = curry((A,A2) => A.ap(A2));
const map = curry((f,F) => F.map(f));
const chain = curry((f, M) => M.chain(f));
const liftA2 = curry((f, A1, A2) => F1.map(f).ap(A2));
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));


module.exports = {
  compose,
  curry,
  ap,
  map,
  chain,
  liftA2,
  liftA3
}