//const test = require('tape');
const test = require('tap').test;//more verbose


const {Just,Nothing} = require('../src/Maybe.js');

test('toJSON', function (t) {
  t.equals(Nothing.toJSON(), '{"type":"Maybe.Nothing"}', 'Nothing serializes to an object');
  t.equals(Just(2).toJSON(), '{"type":"Maybe.Just","value":2}', 'Just serializes to an object with primitive data');
  t.equals(Just([[5]]).toJSON(), '{"type":"Maybe.Just","value":[[5]]}', 'Just serializes to an object with complex data');
  t.equals(Just(Promise.resolve(9)).toJSON(), '{"type":"Maybe.Just","value":{}}', 'Just serializes any data that can be stringified, has regular JSON.stringigy behavior when it cannot');
  t.end();
});