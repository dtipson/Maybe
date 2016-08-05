//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('null & undefined are falsy', function (t) {
  t.equals(Just(9).toString(), 'Just[9]', 'string representation of Justs');
  t.equals(Nothing.toString(), 'Nothing', 'string representation of Nothings');
  t.end();
});


test('coercion', function (t) {
  t.equals(`${Nothing}1`, '1', 'Nothing coerces into a String');
  t.equals(String(Nothing), '', 'Nothing coerces into a String');
  t.equals(Nothing+0, 0, 'Nothing coerces into Numbers');
  t.equals(Nothing+1, 1, 'Nothing coerces into Numbers');

  t.equals(Just(9)+1, 10, 'Just coerces out the value (number)');
  t.equals(Just("hi")+" there", "hi there", 'Just out the value (string)');
  t.end();
});