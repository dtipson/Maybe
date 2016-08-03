//const test = require('tape');
const test = require('tap').test;//more verbose

const {Just,Maybe} = require('../src/Maybe.js');

test('Identity', function (t) {

  const nine = Just(9);

  t.same(nine.concat(Maybe.empty()), nine,'right identity');
  t.same(Maybe.empty().concat(nine), nine, 'left identity');
  t.end();
});
