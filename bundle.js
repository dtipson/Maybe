(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

//native prototype enhancements
require('./src/other-types/Array-helpers.js');
require('./src/other-types/Function-helpers.js');
require('./src/other-types/Promise-helpers.js');


const Compose = require('./src/other-types/Compose.js');
const Const = require('./src/other-types/Const.js');
const Continuation = require('./src/other-types/Continuation.js');//total nonsense, really
const Coyoneda = require('./src/other-types/Coyoneda.js');
const Identity = require('./src/other-types/Identity.js');
const IO = require('./src/other-types/IO.js');
const Reader = require('./src/other-types/Reader.js');
const State = require('./src/other-types/State.js');
const Store = require('./src/other-types/Store.js');
const Tuple = require('./src/other-types/Tuple.js');
const Task = require('./src/other-types/Task.js');
const RemoteData = require('./src/other-types/RemoteData.js');
const Writer = require('./src/other-types/Writer-array.js');
const { List, Map } = require('immutable-ext');

const {NotAsked,Requested,Loading,Failure,Success} = RemoteData;

Object.assign(
  window,
  require('./src/other-types/daggy.js'),
  require('./src/Maybe.js'),
  require('./src/media-recorder/videobooth.js'),
  require('./src/other-types/Either.js'),
  require('./src/other-types/lenses.js'),
  {Compose, Const, Continuation, Cont:Continuation, List, Task, Coyoneda, Id: Identity, Identity, Box: Identity, IO, Map, Reader, RemoteData, Tuple, State, Store, Writer, NotAsked,Requested,Loading,Failure,Success},
  require('./src/other-types/pointfree.js'),
  require('./src/other-types/merges.js'),
  require('./src/other-types/monoids.js'),
  require('./src/other-types/Tree.js'),
  //require('./src/other-types/Validation.js'),
  require('./src/other-types/natural-transformations.js'),
  require('./src/other-types/utility.js')
);
},{"./src/Maybe.js":4,"./src/media-recorder/videobooth.js":5,"./src/other-types/Array-helpers.js":6,"./src/other-types/Compose.js":7,"./src/other-types/Const.js":8,"./src/other-types/Continuation.js":9,"./src/other-types/Coyoneda.js":10,"./src/other-types/Either.js":11,"./src/other-types/Function-helpers.js":12,"./src/other-types/IO.js":13,"./src/other-types/Identity.js":14,"./src/other-types/Promise-helpers.js":15,"./src/other-types/Reader.js":16,"./src/other-types/RemoteData.js":17,"./src/other-types/State.js":18,"./src/other-types/Store.js":19,"./src/other-types/Task.js":20,"./src/other-types/Tree.js":21,"./src/other-types/Tuple.js":22,"./src/other-types/Writer-array.js":23,"./src/other-types/daggy.js":24,"./src/other-types/lenses.js":25,"./src/other-types/merges.js":26,"./src/other-types/monoids.js":27,"./src/other-types/natural-transformations.js":28,"./src/other-types/pointfree.js":29,"./src/other-types/utility.js":30,"immutable-ext":2}],2:[function(require,module,exports){
const Immutable = require('immutable')
const {List, Map} = Immutable

const derived = {
  fold : function(empty) {
    return this.reduce((acc, x) => acc.concat(x), empty)
  },
  foldMap : function(f, empty) {
    return this.map(f).fold(empty)
  },
  sequence : function(point) {
    return this.traverse(point, x => x)
  }
}

// List
//====================

// monoid
List.empty = List()
List.prototype.empty = List.empty

// traversable
List.prototype.traverse = function(point, f) {
  return this.reduce((ys, x) =>
    f(x).map(x => y => y.concat([x])).ap(ys), point(List()))
}

List.prototype.sequence = derived.sequence

// foldable
List.prototype.fold = derived.fold
List.prototype.foldMap = derived.foldMap

// applicative
List.prototype.ap = function(other) {
  return this.map(f => other.map(x => f(x))).flatten()
}

// monad
List.prototype.chain = List.prototype.flatMap;



// Map
//===============


// semigroup
Map.prototype.concat = function(other) {
  return this.mergeWith((prev, next) => prev.concat(next), other)
}

// monoid
Map.empty = Map({})
Map.prototype.empty = Map.empty

// foldable
Map.prototype.fold = derived.fold
Map.prototype.foldMap = derived.foldMap

// traverable
Map.prototype.traverse = function(point, f) {
  return this.reduce((acc, v, k) =>
    f(v, k).map(x => y => y.merge({[k]: x})).ap(acc), point(Map.empty))
}

Map.prototype.sequence = derived.sequence

// monad
Map.prototype.chain = Map.prototype.flatMap

module.exports = Immutable

},{"immutable":3}],3:[function(require,module,exports){
/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Immutable = factory());
}(this, function () { 'use strict';var SLICE$0 = Array.prototype.slice;

  function createClass(ctor, superClass) {
    if (superClass) {
      ctor.prototype = Object.create(superClass.prototype);
    }
    ctor.prototype.constructor = ctor;
  }

  function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }


  createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }


  createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }


  createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



  function isIterable(maybeIterable) {
    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
  }

  function isKeyed(maybeKeyed) {
    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
  }

  function isIndexed(maybeIndexed) {
    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function isOrdered(maybeOrdered) {
    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
  }

  Iterable.isIterable = isIterable;
  Iterable.isKeyed = isKeyed;
  Iterable.isIndexed = isIndexed;
  Iterable.isAssociative = isAssociative;
  Iterable.isOrdered = isOrdered;

  Iterable.Keyed = KeyedIterable;
  Iterable.Indexed = IndexedIterable;
  Iterable.Set = SetIterable;


  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  // Used for setting prototype methods that IE8 chokes on.
  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  var CHANGE_LENGTH = { value: false };
  var DID_ALTER = { value: false };

  function MakeRef(ref) {
    ref.value = false;
    return ref;
  }

  function SetRef(ref) {
    ref && (ref.value = true);
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  // http://jsperf.com/copy-array-inline
  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    // This implements "is array index" which the ECMAString spec defines as:
    //
    //     A String property name P is an array index if and only if
    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
    //     to 2^32−1.
    //
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
      defaultIndex :
      index < 0 ?
        Math.max(0, size + index) :
        size === undefined ?
          index :
          Math.min(size, index);
  }

  /* global Symbol */

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


  function Iterator(next) {
      this.next = next;
    }

    Iterator.prototype.toString = function() {
      return '[Iterator]';
    };


  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect =
  Iterator.prototype.toSource = function () { return this.toString(); }
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };


  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
      value: value, done: false
    });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn = iterable && (
      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]
    );
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  function isArrayLike(value) {
    return value && typeof value.length === 'number';
  }

  createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() :
        isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function(/*...values*/) {
      return Seq(arguments);
    };

    Seq.prototype.toSeq = function() {
      return this;
    };

    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };



  createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ?
        emptySequence().toKeyedSeq() :
        isIterable(value) ?
          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
          keyedSeqFromValue(value);
    }

    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };



  createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function(/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };

    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };



  createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (
        value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value
      ).toSetSeq();
    }

    SetSeq.of = function(/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function() {
      return this;
    };



  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

  Seq.prototype[IS_SEQ_SENTINEL] = true;



  createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new Iterator(function() 
        {return ii > maxIndex ?
          iteratorDone() :
          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
      );
    };



  createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, key, object[key]);
      });
    };

  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };



  createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new Iterator(function()  {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };




  // # pragma Helper functions

  function isSeq(maybeSeq) {
    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
  }

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq =
      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
      typeof value === 'object' ? new ObjectSeq(value) :
      undefined;
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of [k, v] entries, '+
        'or keyed object: ' + value
      );
    }
    return seq;
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values: ' + value
      );
    }
    return seq;
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value) ||
      (typeof value === 'object' && new ObjectSeq(value));
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values, or keyed object: ' + value
      );
    }
    return seq;
  }

  function maybeIndexedSeqFromValue(value) {
    return (
      isArrayLike(value) ? new ArraySeq(value) :
      isIterator(value) ? new IteratorSeq(value) :
      hasIterator(value) ? new IterableSeq(value) :
      undefined
    );
  }

  function seqIterate(seq, fn, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var entry = cache[reverse ? maxIndex - ii : ii];
        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
          return ii + 1;
        }
      }
      return ii;
    }
    return seq.__iterateUncached(fn, reverse);
  }

  function seqIterator(seq, type, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var entry = cache[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
      });
    }
    return seq.__iteratorUncached(type, reverse);
  }

  function fromJS(json, converter) {
    return converter ?
      fromJSWith(converter, json, '', {'': json}) :
      fromJSDefault(json);
  }

  function fromJSWith(converter, json, key, parentJSON) {
    if (Array.isArray(json)) {
      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    if (isPlainObj(json)) {
      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    return json;
  }

  function fromJSDefault(json) {
    if (Array.isArray(json)) {
      return IndexedSeq(json).map(fromJSDefault).toList();
    }
    if (isPlainObj(json)) {
      return KeyedSeq(json).map(fromJSDefault).toMap();
    }
    return json;
  }

  function isPlainObj(value) {
    return value && (value.constructor === Object || value.constructor === undefined);
  }

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if the it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections implement `equals` and `hashCode`.
   *
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (typeof valueA.valueOf === 'function' &&
        typeof valueB.valueOf === 'function') {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
    }
    if (typeof valueA.equals === 'function' &&
        typeof valueB.equals === 'function' &&
        valueA.equals(valueB)) {
      return true;
    }
    return false;
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isIterable(b) ||
      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return b.every(function(v, k)  {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done;
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        if (typeof a.cacheResult === 'function') {
          a.cacheResult();
        }
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function(v, k)  {
      if (notAssociative ? !a.has(v) :
          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function(searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this :
        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function() {
      return this;
    };

    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
      var ii = 0;
      return new Iterator(function() 
        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
      );
    };

    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ?
        is(this._value, other._value) :
        deepEqual(other);
    };


  var EMPTY_REPEAT;

  function invariant(condition, error) {
    if (!condition) throw new Error(error);
  }

  createClass(Range, IndexedSeq);

    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' +
        this._start + '...' + this._end +
        (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]';
    };

    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ?
        this._start + wrapIndex(this, index) * this._step :
        notSetValue;
    };

    Range.prototype.includes = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };

    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new Iterator(function()  {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };

    Range.prototype.equals = function(other) {
      return other instanceof Range ?
        this._start === other._start &&
        this._end === other._end &&
        this._step === other._step :
        deepEqual(this, other);
    };


  var EMPTY_RANGE;

  createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }


  createClass(KeyedCollection, Collection);function KeyedCollection() {}

  createClass(IndexedCollection, Collection);function IndexedCollection() {}

  createClass(SetCollection, Collection);function SetCollection() {}


  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
    Math.imul :
    function imul(a, b) {
      a = a | 0; // int
      b = b | 0; // int
      var c = a & 0xffff;
      var d = b & 0xffff;
      // Shift by 0 fixes the sign on the high part.
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
    };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
  }

  function hash(o) {
    if (o === false || o === null || o === undefined) {
      return 0;
    }
    if (typeof o.valueOf === 'function') {
      o = o.valueOf();
      if (o === false || o === null || o === undefined) {
        return 0;
      }
    }
    if (o === true) {
      return 1;
    }
    var type = typeof o;
    if (type === 'number') {
      if (o !== o || o === Infinity) {
        return 0;
      }
      var h = o | 0;
      if (h !== o) {
        h ^= o * 0xFFFFFFFF;
      }
      while (o > 0xFFFFFFFF) {
        o /= 0xFFFFFFFF;
        h ^= o;
      }
      return smi(h);
    }
    if (type === 'string') {
      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
    }
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    if (type === 'object') {
      return hashJSObj(o);
    }
    if (typeof o.toString === 'function') {
      return hashString(o.toString());
    }
    throw new Error('Value type ' + type + ' cannot be hashed.');
  }

  function cachedHashString(string) {
    var hash = stringHashCache[string];
    if (hash === undefined) {
      hash = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hash;
    }
    return hash;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = 31 * hash + string.charCodeAt(ii) | 0;
    }
    return smi(hash);
  }

  function hashJSObj(obj) {
    var hash;
    if (usingWeakMap) {
      hash = weakMap.get(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = obj[UID_HASH_KEY];
    if (hash !== undefined) {
      return hash;
    }

    if (!canDefineProperty) {
      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hash !== undefined) {
        return hash;
      }

      hash = getIENodeHash(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (usingWeakMap) {
      weakMap.set(obj, hash);
    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (obj.propertyIsEnumerable !== undefined &&
               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function() {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType !== undefined) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hash;
  }

  // Get references to ES5 object methods.
  var isExtensible = Object.isExtensible;

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function() {
    try {
      Object.defineProperty({}, '@', {});
      return true;
    } catch (e) {
      return false;
    }
  }());

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var usingWeakMap = typeof WeakMap === 'function';
  var weakMap;
  if (usingWeakMap) {
    weakMap = new WeakMap();
  }

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
      return value === null || value === undefined ? emptyMap() :
        isMap(value) && !isOrdered(value) ? value :
        emptyMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    Map.of = function() {var keyValues = SLICE$0.call(arguments, 0);
      return emptyMap().withMutations(function(map ) {
        for (var i = 0; i < keyValues.length; i += 2) {
          if (i + 1 >= keyValues.length) {
            throw new Error('Missing value for key: ' + keyValues[i]);
          }
          map.set(keyValues[i], keyValues[i + 1]);
        }
      });
    };

    Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function(k, notSetValue) {
      return this._root ?
        this._root.get(0, undefined, k, notSetValue) :
        notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function()  {return v});
    };

    Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function()  {return NOT_SET});
    };

    Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ?
        k(this) :
        this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(
        this,
        forceIterator(keyPath),
        notSetValue,
        updater
      );
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function(/*...iters*/) {
      return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.merge === 'function' ?
          m.merge.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoMapWith(this, deepMerger, arguments);
    };

    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMergerWith(merger), iters);
    };

    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.mergeDeep === 'function' ?
          m.mergeDeep.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.sort = function(comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function() {
      return this.__altered;
    };

    Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry ) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };


  function isMap(maybeMap) {
    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
  }

  Map.isMap = isMap;

  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SENTINEL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeIn = MapPrototype.deleteIn;


  // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }

    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && entries.length === 1) {
        return; // undefined
      }

      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue :
        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;

      if (!exists && value === NOT_SET) {
        return this;
      }

      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

      if (newNode === node) {
        return this;
      }

      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }

      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }

      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ?
        setIn(nodes, idx, newNode, isEditable) :
        spliceOut(nodes, idx, isEditable) :
        spliceIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }

      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];

      if (removed && !node) {
        return this;
      }

      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }

      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }

      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }

    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }

      var removed = value === NOT_SET;

      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }

    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }

      SetRef(didAlter);

      if (removed) {
        SetRef(didChangeSize);
        return; // undefined
      }

      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }

      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



  // #pragma Iterators

  ArrayMapNode.prototype.iterate =
  HashCollisionNode.prototype.iterate = function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }

  BitmapIndexedNode.prototype.iterate =
  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }

  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  }

  createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };


  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef(CHANGE_LENGTH);
      var didAlter = MakeRef(DID_ALTER);
      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
  }

  function isLeafNode(node) {
    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes = idx1 === idx2 ?
      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
      ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
        bitmap |= bit;
        packedNodes[packedII++] = node;
      }
    }
    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
  }

  function expandNodes(ownerID, nodes, bitmap, including, node) {
    var count = 0;
    var expandedNodes = new Array(SIZE);
    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function mergeIntoMapWith(map, merger, iterables) {
    var iters = [];
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = KeyedIterable(value);
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    return mergeIntoCollectionWith(map, merger, iters);
  }

  function deepMerger(existing, value, key) {
    return existing && existing.mergeDeep && isIterable(value) ?
      existing.mergeDeep(value) :
      is(existing, value) ? existing : value;
  }

  function deepMergerWith(merger) {
    return function(existing, value, key)  {
      if (existing && existing.mergeDeepWith && isIterable(value)) {
        return existing.mergeDeepWith(merger, value);
      }
      var nextValue = merger(existing, value, key);
      return is(existing, nextValue) ? existing : nextValue;
    };
  }

  function mergeIntoCollectionWith(collection, merger, iters) {
    iters = iters.filter(function(x ) {return x.size !== 0});
    if (iters.length === 0) {
      return collection;
    }
    if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function(collection ) {
      var mergeIntoMap = merger ?
        function(value, key)  {
          collection.update(key, NOT_SET, function(existing )
            {return existing === NOT_SET ? value : merger(existing, value, key)}
          );
        } :
        function(value, key)  {
          collection.set(key, value);
        }
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoMap);
      }
    });
  }

  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
    var isNotSet = existing === NOT_SET;
    var step = keyPathIter.next();
    if (step.done) {
      var existingValue = isNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    invariant(
      isNotSet || (existing && existing.set),
      'invalid keyPath'
    );
    var key = step.value;
    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
    var nextUpdated = updateInDeepMap(
      nextExisting,
      keyPathIter,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting ? existing :
      nextUpdated === NOT_SET ? existing.remove(key) :
      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
  }

  function popCount(x) {
    x = x - ((x >> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x = x + (x >> 8);
    x = x + (x >> 16);
    return x & 0x7f;
  }

  function setIn(array, idx, val, canEdit) {
    var newArray = canEdit ? array : arrCopy(array);
    newArray[idx] = val;
    return newArray;
  }

  function spliceIn(array, idx, val, canEdit) {
    var newLen = array.length + 1;
    if (canEdit && idx + 1 === newLen) {
      array[idx] = val;
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        newArray[ii] = val;
        after = -1;
      } else {
        newArray[ii] = array[ii + after];
      }
    }
    return newArray;
  }

  function spliceOut(array, idx, canEdit) {
    var newLen = array.length - 1;
    if (canEdit && idx === newLen) {
      array.pop();
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        after = 1;
      }
      newArray[ii] = array[ii + after];
    }
    return newArray;
  }

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list ) {
        list.setSize(size);
        iter.forEach(function(v, i)  {return list.set(i, v)});
      });
    }

    List.of = function(/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function(index) {
      return !this.has(index) ? this :
        index === 0 ? this.shift() :
        index === this.size - 1 ? this.pop() :
        this.splice(index, 1);
    };

    List.prototype.insert = function(index, value) {
      return this.splice(index, 0, value);
    };

    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function(/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list ) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function(/*...values*/) {
      var values = arguments;
      return this.withMutations(function(list ) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function(/*...iters*/) {
      return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoListWith(this, deepMerger, arguments);
    };

    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMergerWith(merger), iters);
    };

    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new Iterator(function()  {
        var value = values();
        return value === DONE ?
          iteratorDone() :
          iteratorValue(type, index++, value);
      });
    };

    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


  function isList(maybeList) {
    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
  }

  List.isList = isList;

  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SENTINEL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.setIn = MapPrototype.setIn;
  ListPrototype.deleteIn =
  ListPrototype.removeIn = MapPrototype.removeIn;
  ListPrototype.update = MapPrototype.update;
  ListPrototype.updateIn = MapPrototype.updateIn;
  ListPrototype.mergeIn = MapPrototype.mergeIn;
  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  ListPrototype.withMutations = MapPrototype.withMutations;
  ListPrototype.asMutable = MapPrototype.asMutable;
  ListPrototype.asImmutable = MapPrototype.asImmutable;
  ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };

    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }

      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }

      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };



  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0 ?
        iterateLeaf(node, offset) :
        iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        do {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx], level - SHIFT, offset + (idx << level)
          );
        } while (true);
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index !== index) {
      return list;
    }

    if (index >= list.size || index < 0) {
      return list.withMutations(function(list ) {
        index < 0 ?
          setListBounds(list, index).set(0, value) :
          setListBounds(list, 0, index + 1).set(index, value)
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef(DID_ALTER);
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    SetRef(didAlter);

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      end = end | 0;
    }
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might need creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might need creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail = newTailOffset < oldTailOffset ?
      listNodeFor(list, newCapacity - 1) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function mergeIntoListWith(list, merger, iterables) {
    var iters = [];
    var maxSize = 0;
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = IndexedIterable(value);
      if (iter.size > maxSize) {
        maxSize = iter.size;
      }
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    if (maxSize > list.size) {
      list = list.setSize(maxSize);
    }
    return mergeIntoCollectionWith(list, merger, iters);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
  }

  createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() :
        isOrderedMap(value) ? value :
        emptyOrderedMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    OrderedMap.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._list.__iterate(
        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) { // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else {
      if (has) {
        if (v === list.get(i)[1]) {
          return omap;
        }
        newMap = map;
        newList = list.set(i, [k, v]);
      } else {
        newMap = map.set(k, list.size);
        newList = list.set(list.size, [k, v]);
      }
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var ii;
      return this._iter.__iterate(
        this._useKeys ?
          function(v, k)  {return fn(v, k, this$0)} :
          ((ii = reverse ? resolveSize(this) : 0),
            function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
        reverse
      );
    };

    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };

  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToIndexedSequence.prototype.includes = function(value) {
      return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, iterations++, step.value, step)
      });
    };



  createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToSetSequence.prototype.has = function(key) {
      return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
    };

    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, step.value, step.value, step);
      });
    };



  createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(entry ) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedIterable = isIterable(entry);
          return fn(
            indexedIterable ? entry.get(1) : entry[1],
            indexedIterable ? entry.get(0) : entry[0],
            this$0
          );
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            var indexedIterable = isIterable(entry);
            return iteratorValue(
              type,
              indexedIterable ? entry.get(0) : entry[0],
              indexedIterable ? entry.get(1) : entry[1],
              step
            );
          }
        }
      });
    };


  ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;


  function flipFactory(iterable) {
    var flipSequence = makeSequence(iterable);
    flipSequence._iter = iterable;
    flipSequence.size = iterable.size;
    flipSequence.flip = function()  {return iterable};
    flipSequence.reverse = function () {
      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function()  {return iterable.reverse()};
      return reversedSequence;
    };
    flipSequence.has = function(key ) {return iterable.includes(key)};
    flipSequence.includes = function(key ) {return iterable.has(key)};
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
    }
    flipSequence.__iteratorUncached = function(type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = iterable.__iterator(type, reverse);
        return new Iterator(function()  {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return iterable.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    }
    return flipSequence;
  }


  function mapFactory(iterable, mapper, context) {
    var mappedSequence = makeSequence(iterable);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function(key ) {return iterable.has(key)};
    mappedSequence.get = function(key, notSetValue)  {
      var v = iterable.get(key, NOT_SET);
      return v === NOT_SET ?
        notSetValue :
        mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(
        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
        reverse
      );
    }
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, iterable),
          step
        );
      });
    }
    return mappedSequence;
  }


  function reverseFactory(iterable, useKeys) {
    var reversedSequence = makeSequence(iterable);
    reversedSequence._iter = iterable;
    reversedSequence.size = iterable.size;
    reversedSequence.reverse = function()  {return iterable};
    if (iterable.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(iterable);
        flipSequence.reverse = function()  {return iterable.flip()};
        return flipSequence;
      };
    }
    reversedSequence.get = function(key, notSetValue) 
      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
    reversedSequence.has = function(key )
      {return iterable.has(useKeys ? key : -1 - key)};
    reversedSequence.includes = function(value ) {return iterable.includes(value)};
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
    };
    reversedSequence.__iterator =
      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
    return reversedSequence;
  }


  function filterFactory(iterable, predicate, context, useKeys) {
    var filterSequence = makeSequence(iterable);
    if (useKeys) {
      filterSequence.has = function(key ) {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
      };
      filterSequence.get = function(key, notSetValue)  {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
          v : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, iterable)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    }
    return filterSequence;
  }


  function countByFactory(iterable, grouper, context) {
    var groups = Map().asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        0,
        function(a ) {return a + 1}
      );
    });
    return groups.asImmutable();
  }


  function groupByFactory(iterable, grouper, context) {
    var isKeyedIter = isKeyed(iterable);
    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
      );
    });
    var coerce = iterableClass(iterable);
    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
  }


  function sliceFactory(iterable, begin, end, useKeys) {
    var originalSize = iterable.size;

    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      if (end === Infinity) {
        end = originalSize;
      } else {
        end = end | 0;
      }
    }

    if (wholeSlice(begin, end, originalSize)) {
      return iterable;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size and these do not resolve to NaN.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
    }

    // Note: resolvedEnd is undefined when the original sequence's length is
    // unknown and this slice did not supply an end and should contain all
    // elements after resolvedBegin.
    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
    var resolvedSize = resolvedEnd - resolvedBegin;
    var sliceSize;
    if (resolvedSize === resolvedSize) {
      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
    }

    var sliceSeq = makeSequence(iterable);

    // If iterable.size is undefined, the size of the realized sliceSeq is
    // unknown at this point unless the number of items to slice is 0
    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize ?
          iterable.get(index + resolvedBegin, notSetValue) :
          notSetValue;
      }
    }

    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k)  {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                 iterations !== sliceSize;
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function(type, reverse) {
      if (sliceSize !== 0 && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function()  {
        while (skipped++ < resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES) {
          return step;
        } else if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        } else {
          return iteratorValue(type, iterations - 1, step.value[1], step);
        }
      });
    }

    return sliceSeq;
  }


  function takeWhileFactory(iterable, predicate, context) {
    var takeSequence = makeSequence(iterable);
    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      iterable.__iterate(function(v, k, c) 
        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function()  {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$0)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }


  function skipWhileFactory(iterable, predicate, context, useKeys) {
    var skipSequence = makeSequence(iterable);
    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function()  {
        var step, k, v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$0));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }


  function concatFactory(iterable, values) {
    var isKeyedIterable = isKeyed(iterable);
    var iters = [iterable].concat(values).map(function(v ) {
      if (!isIterable(v)) {
        v = isKeyedIterable ?
          keyedSeqFromValue(v) :
          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedIterable) {
        v = KeyedIterable(v);
      }
      return v;
    }).filter(function(v ) {return v.size !== 0});

    if (iters.length === 0) {
      return iterable;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (singleton === iterable ||
          isKeyedIterable && isKeyed(singleton) ||
          isIndexed(iterable) && isIndexed(singleton)) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedIterable) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(iterable)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(
      function(sum, seq)  {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      },
      0
    );
    return concatSeq;
  }


  function flattenFactory(iterable, depth, useKeys) {
    var flatSequence = makeSequence(iterable);
    flatSequence.__iterateUncached = function(fn, reverse) {
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {var this$0 = this;
        iter.__iterate(function(v, k)  {
          if ((!depth || currentDepth < depth) && isIterable(v)) {
            flatDeep(v, currentDepth + 1);
          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
            stopped = true;
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(iterable, 0);
      return iterations;
    }
    flatSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function()  {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isIterable(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    }
    return flatSequence;
  }


  function flatMapFactory(iterable, mapper, context) {
    var coerce = iterableClass(iterable);
    return iterable.toSeq().map(
      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
    ).flatten(true);
  }


  function interposeFactory(iterable, separator) {
    var interposedSequence = makeSequence(iterable);
    interposedSequence.size = iterable.size && iterable.size * 2 -1;
    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k) 
        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
        fn(v, iterations++, this$0) !== false},
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function()  {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2 ?
          iteratorValue(type, iterations++, separator) :
          iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }


  function sortFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedIterable = isKeyed(iterable);
    var index = 0;
    var entries = iterable.toSeq().map(
      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
    ).toArray();
    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
      isKeyedIterable ?
      function(v, i)  { entries[i].length = 2; } :
      function(v, i)  { entries[i] = v[1]; }
    );
    return isKeyedIterable ? KeyedSeq(entries) :
      isIndexed(iterable) ? IndexedSeq(entries) :
      SetSeq(entries);
  }


  function maxFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = iterable.toSeq()
        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
      return entry && entry[0];
    } else {
      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
    }
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
  }


  function zipWithFactory(keyIter, zipper, iters) {
    var zipSequence = makeSequence(keyIter);
    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function(fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function(type, reverse) {
      var iterators = iters.map(function(i )
        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function()  {
        var steps;
        if (!isDone) {
          steps = iterators.map(function(i ) {return i.next()});
          isDone = steps.some(function(s ) {return s.done});
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(null, steps.map(function(s ) {return s.value}))
        );
      });
    };
    return zipSequence
  }


  // #pragma Helper Functions

  function reify(iter, seq) {
    return isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function resolveSize(iter) {
    assertNotInfinite(iter.size);
    return ensureSize(iter);
  }

  function iterableClass(iterable) {
    return isKeyed(iterable) ? KeyedIterable :
      isIndexed(iterable) ? IndexedIterable :
      SetIterable;
  }

  function makeSequence(iterable) {
    return Object.create(
      (
        isKeyed(iterable) ? KeyedSeq :
        isIndexed(iterable) ? IndexedSeq :
        SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    } else {
      return Seq.prototype.cacheResult.call(this);
    }
  }

  function defaultComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function forceIterator(keyPath) {
    var iter = getIterator(keyPath);
    if (!iter) {
      // Array might not be iterable in this environment, so we need a fallback
      // to our wrapped type.
      if (!isArrayLike(keyPath)) {
        throw new TypeError('Expected iterable or array-like: ' + keyPath);
      }
      iter = getIterator(Iterable(keyPath));
    }
    return iter;
  }

  createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
      var hasInitialized;

      var RecordType = function Record(values) {
        if (values instanceof RecordType) {
          return values;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys = Object.keys(defaultValues);
          setProps(RecordTypePrototype, keys);
          RecordTypePrototype.size = keys.length;
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys;
          RecordTypePrototype._defaultValues = defaultValues;
        }
        this._map = Map(values);
      };

      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;

      return RecordType;
    }

    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var RecordType = this.constructor;
      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      if (this._map && !this._map.has(k)) {
        var defaultVal = this._defaultValues[k];
        if (v === defaultVal) {
          return this;
        }
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };


  var RecordPrototype = Record.prototype;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn =
  RecordPrototype.removeIn = MapPrototype.removeIn;
  RecordPrototype.merge = MapPrototype.merge;
  RecordPrototype.mergeWith = MapPrototype.mergeWith;
  RecordPrototype.mergeIn = MapPrototype.mergeIn;
  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  RecordPrototype.setIn = MapPrototype.setIn;
  RecordPrototype.update = MapPrototype.update;
  RecordPrototype.updateIn = MapPrototype.updateIn;
  RecordPrototype.withMutations = MapPrototype.withMutations;
  RecordPrototype.asMutable = MapPrototype.asMutable;
  RecordPrototype.asImmutable = MapPrototype.asImmutable;


  function makeRecord(likeRecord, map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record._name || record.constructor.name || 'Record';
  }

  function setProps(prototype, names) {
    try {
      names.forEach(setProp.bind(undefined, prototype));
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }
  }

  function setProp(prototype, name) {
    Object.defineProperty(prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      }
    });
  }

  createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
      return value === null || value === undefined ? emptySet() :
        isSet(value) && !isOrdered(value) ? value :
        emptySet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    Set.of = function(/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function(value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x ) {return x.size !== 0});
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set ) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
        }
      });
    };

    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (!iters.every(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (iters.some(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };

    Set.prototype.sort = function(comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
    };

    Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };


  function isSet(maybeSet) {
    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
  }

  Set.isSet = isSet;

  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SENTINEL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.mergeDeep = SetPrototype.merge;
  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
  SetPrototype.withMutations = MapPrototype.withMutations;
  SetPrototype.asMutable = MapPrototype.asMutable;
  SetPrototype.asImmutable = MapPrototype.asImmutable;

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map ? set :
      newMap.size === 0 ? set.__empty() :
      set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() :
        isOrderedSet(value) ? value :
        emptyOrderedSet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    OrderedSet.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };


  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
  }

  createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
      return value === null || value === undefined ? emptyStack() :
        isStack(value) ? value :
        emptyStack().unshiftAll(value);
    }

    Stack.of = function(/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function(/*...values*/) {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value ) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function() {
      return this.slice(1);
    };

    Stack.prototype.unshift = function(/*...values*/) {
      return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };

    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.reverse().__iterate(fn);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.reverse().__iterator(type);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function()  {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };


  function isStack(maybeStack) {
    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
  }

  Stack.isStack = isStack;

  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SENTINEL] = true;
  StackPrototype.withMutations = MapPrototype.withMutations;
  StackPrototype.asMutable = MapPrototype.asMutable;
  StackPrototype.asImmutable = MapPrototype.asImmutable;
  StackPrototype.wasAltered = MapPrototype.wasAltered;


  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  /**
   * Contributes additional methods to a constructor
   */
  function mixin(ctor, methods) {
    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  Iterable.Iterator = Iterator;

  mixin(Iterable, {

    // ### Conversion to other types

    toArray: function() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
      return array;
    },

    toIndexedSeq: function() {
      return new ToIndexedSequence(this);
    },

    toJS: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
      ).__toJS();
    },

    toJSON: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
      ).__toJS();
    },

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: function() {
      assertNotInfinite(this.size);
      var object = {};
      this.__iterate(function(v, k)  { object[k] = v; });
      return object;
    },

    toOrderedMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function() {
      return new ToSetSequence(this);
    },

    toSeq: function() {
      return isIndexed(this) ? this.toIndexedSeq() :
        isKeyed(this) ? this.toKeyedSeq() :
        this.toSetSeq();
    },

    toStack: function() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },


    // ### Common JavaScript methods and properties

    toString: function() {
      return '[Iterable]';
    },

    __toString: function(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function() {var values = SLICE$0.call(arguments, 0);
      return reify(this, concatFactory(this, values));
    },

    includes: function(searchValue) {
      return this.some(function(value ) {return is(value, searchValue)});
    },

    entries: function() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function(v, k, c)  {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    forEach: function(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function(v ) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v.toString() : '';
      });
      return joined;
    },

    keys: function() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function(reducer, initialReduction, context) {
      assertNotInfinite(this.size);
      var reduction;
      var useFirst;
      if (arguments.length < 2) {
        useFirst = true;
      } else {
        reduction = initialReduction;
      }
      this.__iterate(function(v, k, c)  {
        if (useFirst) {
          useFirst = false;
          reduction = v;
        } else {
          reduction = reducer.call(context, reduction, v, k, c);
        }
      });
      return reduction;
    },

    reduceRight: function(reducer, initialReduction, context) {
      var reversed = this.toKeyedSeq().reverse();
      return reversed.reduce.apply(reversed, arguments);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function() {
      return this.__iterator(ITERATE_VALUES);
    },


    // ### More sequential methods

    butLast: function() {
      return this.slice(0, -1);
    },

    isEmpty: function() {
      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
    },

    count: function(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function(other) {
      return deepEqual(this, other);
    },

    entrySeq: function() {
      var iterable = this;
      if (iterable._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(iterable._cache);
      }
      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
      return entriesSequence;
    },

    filterNot: function(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findEntry: function(predicate, context, notSetValue) {
      var found = notSetValue;
      this.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findKey: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLast: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    findLastEntry: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().findEntry(predicate, context, notSetValue);
    },

    findLastKey: function(predicate, context) {
      return this.toKeyedSeq().reverse().findKey(predicate, context);
    },

    first: function() {
      return this.find(returnTrue);
    },

    flatMap: function(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function() {
      return new FromEntriesSequence(this);
    },

    get: function(searchKey, notSetValue) {
      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
    },

    getIn: function(searchKeyPath, notSetValue) {
      var nested = this;
      // Note: in an ES6 environment, we would prefer:
      // for (var key of searchKeyPath) {
      var iter = forceIterator(searchKeyPath);
      var step;
      while (!(step = iter.next()).done) {
        var key = step.value;
        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
      return nested;
    },

    groupBy: function(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: function(searchKeyPath) {
      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
    },

    isSubset: function(iter) {
      iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
      return this.every(function(value ) {return iter.includes(value)});
    },

    isSuperset: function(iter) {
      iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
      return iter.isSubset(this);
    },

    keyOf: function(searchValue) {
      return this.findKey(function(value ) {return is(value, searchValue)});
    },

    keySeq: function() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function() {
      return this.toSeq().reverse().first();
    },

    lastKeyOf: function(searchValue) {
      return this.toKeyedSeq().reverse().keyOf(searchValue);
    },

    max: function(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function(comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
    },

    minBy: function(mapper, comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
    },

    rest: function() {
      return this.slice(1);
    },

    skip: function(amount) {
      return this.slice(Math.max(0, amount));
    },

    skipLast: function(amount) {
      return reify(this, this.toSeq().reverse().skip(amount).reverse());
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function(amount) {
      return reify(this, this.toSeq().reverse().take(amount).reverse());
    },

    takeWhile: function(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    valueSeq: function() {
      return this.toIndexedSeq();
    },


    // ### Hashable Object

    hashCode: function() {
      return this.__hash || (this.__hash = hashIterable(this));
    }


    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  var IterablePrototype = Iterable.prototype;
  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
  IterablePrototype.__toJS = IterablePrototype.toArray;
  IterablePrototype.__toStringMapper = quoteString;
  IterablePrototype.inspect =
  IterablePrototype.toSource = function() { return this.toString(); };
  IterablePrototype.chain = IterablePrototype.flatMap;
  IterablePrototype.contains = IterablePrototype.includes;

  mixin(KeyedIterable, {

    // ### More sequential methods

    flip: function() {
      return reify(this, flipFactory(this));
    },

    mapEntries: function(mapper, context) {var this$0 = this;
      var iterations = 0;
      return reify(this,
        this.toSeq().map(
          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
        ).fromEntrySeq()
      );
    },

    mapKeys: function(mapper, context) {var this$0 = this;
      return reify(this,
        this.toSeq().flip().map(
          function(k, v)  {return mapper.call(context, k, v, this$0)}
        ).flip()
      );
    }

  });

  var KeyedIterablePrototype = KeyedIterable.prototype;
  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return JSON.stringify(k) + ': ' + quoteString(v)};



  mixin(IndexedIterable, {

    // ### Conversion to other types

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, false);
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function(searchValue) {
      var key = this.keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function(searchValue) {
      var key = this.lastKeyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    reverse: function() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum | 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      // If index is negative, it should resolve relative to the size of the
      // collection. However size may be expensive to compute if not cached, so
      // only call count() if the number is in fact negative.
      index = resolveBegin(index, index < 0 ? this.count() : this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1 ?
          spliced :
          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },


    // ### More collection methods

    findLastIndex: function(predicate, context) {
      var entry = this.findLastEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    first: function() {
      return this.get(0);
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function(index, notSetValue) {
      index = wrapIndex(this, index);
      return (index < 0 || (this.size === Infinity ||
          (this.size !== undefined && index > this.size))) ?
        notSetValue :
        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
    },

    has: function(index) {
      index = wrapIndex(this, index);
      return index >= 0 && (this.size !== undefined ?
        this.size === Infinity || index < this.size :
        this.indexOf(index) !== -1
      );
    },

    interpose: function(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function(/*...iterables*/) {
      var iterables = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * iterables.length;
      }
      return reify(this, interleaved);
    },

    keySeq: function() {
      return Range(0, this.size);
    },

    last: function() {
      return this.get(-1);
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function(/*, ...iterables */) {
      var iterables = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, iterables));
    },

    zipWith: function(zipper/*, ...iterables */) {
      var iterables = arrCopy(arguments);
      iterables[0] = this;
      return reify(this, zipWithFactory(this, zipper, iterables));
    }

  });

  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



  mixin(SetIterable, {

    // ### ES6 Collection methods (ES6 Array and Map)

    get: function(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    includes: function(value) {
      return this.has(value);
    },


    // ### More sequential methods

    keySeq: function() {
      return this.valueSeq();
    }

  });

  SetIterable.prototype.has = IterablePrototype.includes;
  SetIterable.prototype.contains = SetIterable.prototype.includes;


  // Mixin subclasses

  mixin(KeyedSeq, KeyedIterable.prototype);
  mixin(IndexedSeq, IndexedIterable.prototype);
  mixin(SetSeq, SetIterable.prototype);

  mixin(KeyedCollection, KeyedIterable.prototype);
  mixin(IndexedCollection, IndexedIterable.prototype);
  mixin(SetCollection, SetIterable.prototype);


  // #pragma Helper functions

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  function neg(predicate) {
    return function() {
      return -predicate.apply(this, arguments);
    }
  }

  function quoteString(value) {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashIterable(iterable) {
    if (iterable.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(iterable);
    var keyed = isKeyed(iterable);
    var h = ordered ? 1 : 0;
    var size = iterable.__iterate(
      keyed ?
        ordered ?
          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
        ordered ?
          function(v ) { h = 31 * h + hash(v) | 0; } :
          function(v ) { h = h + hash(v) | 0; }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = imul(h, 0xCC9E2D51);
    h = imul(h << 15 | h >>> -15, 0x1B873593);
    h = imul(h << 13 | h >>> -13, 5);
    h = (h + 0xE6546B64 | 0) ^ size;
    h = imul(h ^ h >>> 16, 0x85EBCA6B);
    h = imul(h ^ h >>> 13, 0xC2B2AE35);
    h = smi(h ^ h >>> 16);
    return h;
  }

  function hashMerge(a, b) {
    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
  }

  var Immutable = {

    Iterable: Iterable,

    Seq: Seq,
    Collection: Collection,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS

  };

  return Immutable;

}));
},{}],4:[function(require,module,exports){
const {curry, compose, head, init, last, tail, prop} = require('../src/other-types/pointfree.js');
const Task  = require('../src/other-types/Task.js');

function Maybe(){//create a prototype for Nothing/Just to inherit from
    throw new TypeError('Maybe is not called directly');
}

//We only ever need one "Nothing" so we'll define the type, create the one instance, and return it. We could have just created an object with 
//all these methods on it, but then it wouldn't log as nicely/clearly
const Nothing = (function(){
  const Nothing = function(){};
  Nothing.prototype = Object.create(Maybe.prototype);
  Nothing.prototype.ap = Nothing.prototype.chain = Nothing.prototype.join = Nothing.prototype.flatten = Nothing.prototype.map = Nothing.prototype.filter = Nothing.prototype.extend = function(){ return this; };
  Nothing.prototype.sequence = function(of){ return of(this); };//flips Nothing insde a type, i.e.: Type[Nothing]
  Nothing.prototype.traverse = function(fn, of){ return of(this); };//same as above, just ignores the map fn
  Nothing.prototype.reduce = (f, x) => x,//binary function is ignored, the accumulator returned
  Nothing.prototype.fold = (g, f) => typeof g === "function" ? g() : g;
  Nothing.prototype.getOrElse = Nothing.prototype.concat = x => x;//just returns the provided value
  Nothing.prototype.orElse = x => Just(x);
  Nothing.prototype.cata = ({Nothing}) => Nothing();  //not the Nothing type constructor here, btw, a prop named "Nothing" defining a nullary function!
  Nothing.prototype.equals = function(y){return y==this;};//setoid
  Nothing.prototype.toString = _ => 'Nothing';
  Nothing.prototype.toBoolean = _ => false;//reduce a Nothing to false
  //Nothing.prototype[Symbol.toPrimitive] = function(hint){ return hint=='string' ? "" : 0; };//define some behavior for coercion: empty string for string coercion, 0 for number coercion
  Nothing.prototype.toJSON = _ => '{"type":"Maybe.Nothing"}';
  return new Nothing();
})();//result will fail an instanceof Nothing check, because "Nothing" is not the Nothing constructor in the outer scope


//now we'll create a Just type with all the same interfaces we defined on Nothing

Maybe.prototype.empty = _ => Nothing;

//here, we eliminate the need to call it with new
const Just = function(x){
  if (!(this instanceof Just)) {
    return new Just(x);
  }
  this.value = x;//storing the value in the instance
};
Just.prototype = Object.create(Maybe.prototype);
Just.prototype.getOrElse = Just.prototype.flatten = Just.prototype.join = function(){ return this.value; };//transform the inner value
Just.prototype.map = function(f){ return new Just(f(this.value)); };//transform the inner value
Just.prototype.ap = function(b){ return b.map(this.value); };//if the inner value is a function, apply a value to it
Just.prototype.chain = function(f){ return f(this.value); };//transform the inner value, assuming the function returns Just/Nothing
Just.prototype.sequence = function(of){ return this.value.map(Just); };//flip an inner type with the outer Just
Just.prototype.extend = function(f){f(this);}
Just.prototype.traverse = function(fn, of){ return this.map(fn).sequence(of); };//transform the inner value (resulting in an inner type) then flip that type outside
Just.prototype.toString = function(){ return `Just[${this.value}]`; };
Just.prototype.reduce = function(f, x) { return f(x, this.value); };//standard binary function, value in Just is the only item
Just.prototype.fold = function(_, f) { return f(this.value); };


Just.prototype.filter = function(fn){ return this.chain(x=> fn(x)? this : Nothing ); };//test the inner value with a function

//assuming that the inner value has a concat method, concat it with another Just. Falls back to + for strings and numbers
// Just.prototype.concat = function(b){
//   return b.value && !Maybe.isNull(b.value) ? Just(this.value.concat ? this.value.concat(b.value) : this.value + b.value) : this 
// };
Just.prototype.concat = function(b){
  return this.chain(a=>b.map(x=>a.concat(b)));
};
Just.prototype.equals = function(y){ return y.value === this.value; };//strictly compare the inner values
//Just.prototype[Symbol.toPrimitive] = Just.prototype.getOrElse = function(){ return this.value; };//extract the inner value when forcibly coerced to deliver a value
Just.prototype.orElse = function(){ return this; }//does nothing in the Just case
Just.prototype.cata = function({Just}){ return Just(this.value) };//calls the function defined in prop "Just" with the inner value
Just.prototype.toBoolean = _ => true;//reduce a Just to true. Useful in filters
Just.prototype.toJSON = function(){ return `{"type":"Maybe.Just","value":${JSON.stringify(this.value)}}`; };

const isNull = x => x===null || x===undefined;
const fromNullable =  x => isNull(x) ? Nothing : Just(x);//includes null/undefined
const fromFalsy =  x => !x ? Nothing : Just(x);//includes 0 and ""
//includes empty arrays
const fromEmpty =  x => !x || (Array.isArray(x) && !x.length) ? Nothing : Just(x);

//we're not strictly defining Just and Nothing as subtypes of Maybe here, but we DO want to have a Maybe interface for more abstract usages
Object.assign(Maybe, {
  of: x => new Just(x),//pointed interface to create the type (Just(9)/Maybe.of are synonymous )
  Nothing: _ => Nothing,
  Just: x=> new Just(x),
  empty: Nothing.empty,//calling empty returns a Nothing
  toBoolean: m => m!==Nothing,//reduce a passed in Just[any value]/Nothing value to true or false, useful for filters
  isNull,
  fromNullable,
  fromFalsy,
  fromEmpty,
  lift: fn => x => Just(fn(x)),
  fromFilter: fn => x => fn(x) ? Just(x) : Nothing,
  maybe: curry((nothingVal, justFn, M) => M.reduce( (_,x) => justFn(x), nothingVal )),//no accumulator usage
  head: compose(fromNullable, head),//safehead, which is a natural transformation!
  last: compose(fromNullable, last),//safelast
  prop: namespace => compose(fromNullable, prop(namespace))//safeprop
});

//additional FL method
Maybe.prototype.alt = function(b) {
  return this.cata({
    Just: _ => this,
    Nothing: () => b,
  });
};
Maybe.zero = Maybe.prototype.zero = _ => Nothing;
Maybe.prototype.toTask = function(rejmsg) {
  return this.cata({
    Just: x => Task.of(x),
    Nothing: () => Task.rejected(rejmsg),
  });
};


const maybe = Maybe.maybe;//pretty important pattern, yo

module.exports = {
  Maybe,
  Just,
  Nothing,
  maybe
};

/*


The maybe function might need some introduction. It takes 3 arguments, and as it should be with functional programming, all are important.  Argument one is the default case: the fallback.  Argument 2 is a function you want run on a value, if it can be.  The final argument is of the Maybe type: either a Just or a Nothing.

Here's what that gets us: the ability to resolve previously indeterminate possibilities:

maybe(5, x => x+1, Just(4));//-> 5
maybe(5, x => x+1, Nothing);//-> 5

What maybe does here is based on an operation .reduce: in fact, it's just a pointfree helper version of for Maybe[i.e. Just or Nothing].reduce:

const maybe = (nothingVal, justFn, M) => M.reduce(justFn, nothingVal);
//vs
Nothing.prototype.reduce = Nothing.prototype.fold = (f, x) => x,//binary function is ignored, the accumulator returned
Just.prototype.reduce = Just.prototype.fold = function(fn, acc) { return fn(this.value); };//binary function

Just(4).reduce( x=> x+1, 5);//-> 5
Nothing.reduce( x=> x+1, 5);//-> 5

The idea of "reducing" a container type that can hold, at most, a single item anyhow may seem a bit strange if Array.reduce is your only exposure to "reduce." But these are not just two different operations with the same name: .reduce (more often known as "fold" in the FP world) is as deeply lawful and generic an operation as the Monadic operations. 

Now, the whole point of this function is that you usually won't know, at runtime, whether the final argument is going to be Just containing a value or a Nothing. If you did know, then the above operations would be a bit silly: if you want a 5 for something, then just use a 5 already! 

But consider the little mini-program mentioned at the end of the "Getting Something from Nothing" article: a user enters an id, and if the id matches a record in a "database," then it returns a Just containing some information. Otherwise it returns a nothing.  We then used map to format the information and then again to cause a side-effect (an alert) that reported the information back to the user. In the Nothing case, nothing at all happened, which is great: no errors.  But what if we wanted the user to get something back no matter what?  

This is normally where we'd introduce Maybe's amped up cousin, the Either monad. That pattern would allow us to send special data about an error down through the chain of operations (skipping every operation that was mapped, but available to other specialized operations). 

But we can actually use the reduce interface on our Maybe type to achieve some of the same things. Here's a simple case:

getData(4).reduce(x=>x,'No Data Found, sorry');//-> either some data, or "No data found, sorry"

//pointfree
maybe('No Data Found, sorry',x=>x, getData(4));//-> same result

(note that the results here are no longer inside of the Maybe type: the ambiguity of that type is now resolved into a guaranteed result!)

Here, we didn't actually do anything to the Just side of the possible outcomes: we just passed it along using the identity function.  That's great, but let's say that the type of thing you get back from getData was a plain javascript object: we'd obviously want to convert that into a string so that by the end of our little program, the same type (a String) was returned either way:

Just({name:'Drew'}).reduce(JSON.stringify,'No data found, sorry');//-> '{"name":"Drew"}'
Nothing.reduce(JSON.stringify,'No data found, sorry');//-> "No data found, sorry"

Right? The whole point of using a Maybe type is to restore sane, unambiguous type-signatures to our programs so that they are easy to reason about and compose together. If we want the Nothing side of things to ultimately still have a side effect along the same path as the Just side of things, then at some point they _must_ to "fold" down into the same type of output!

That's already some really powerful stuff (at least I hope you think so!) but I didn't really appreciate just how powerful until Fluture author https://github.com/Avaq pointed it out: there's no requirement that the value for the "default case" (aka the accumulator) of maybe/reduce must be a bare, primitive value.

That is: this is functional programing we're talking about here.  What if instead of just reducing down to a single value, we were interested in reducing a functional operation with TWO steps down into one with ONE step.

Here's the base (and mostly uninteresting) example:

const add = x => y => x+y;
const identity = y => y;

const maybeSum = maybe(add, identity);//-> partially applied maybe, waiting for a Maybe value

maybeSum(Just(1));//-> unary function (+1)
maybeSum(Nothing);//-> unary function (identity)

The result of the maybe/reduce operation in this case isn't a value: it's a function. And what our maybe operation did was help us resolve which function to return: if we have a value, a partially applied addition function that will add it to the next value, vs identity, which will just return the next value.  The type signature of the final function is the same, even though it does different things.

It gets tricky to explain exactly what that means, and why it's so cool, without a more complex example/use-case, so hopefully I can boil this down to the essentials.

Imagine that we have some client-side data from user-input.  That data might match a database record that already exists, or it might belong to a record that _doesn't_ yet exist: we don't start off knowing which is which. Let's say for our purposes that email is the unique index, and email is part of the client-side data (perhaps a user is entering information into a form).
const W = f => x => f(x)(x);
//simulated database
const database = {
  "dtipson@gmail.com": {name:"Drew", email:"dtipson@gmail.com"}
}
//simulated database lookup, which returns a Maybe
const maybeGetUserViaEmail = ({email}) => database[email] ? Just(database[email]) : Nothing;



const createUser = data => Object.assign({retrieved: Date.now()}, data);
const updateUser = dbdata => data => Object.assign({retrieved: Date.now()}, dbdata, data);


//merges a db record OR creates it, and returns the merged record 
const getMergedData = W(data => maybeGetUserViaEmail(data).reduce(updateUser, createUser));





getMergedData({email:'dtipson@gmail.com'});//-> {email:'dtipson@gmail.com', name:'Drew'}
getMergedData({email:'edward209@gmail.com', name:'Ed'});//-> {email:'edward209@gmail.com', name:'Ed'}


...transducers...



Of course, if we knew that we always wanted a 5, we'd just have used a five, no Maybe type necessary.

original:
const create = data => ({data, iat: Date.now()});
const update = record => data => ({data: {...record.data, ...data}, iat: Date.now()});

const maybeRecord = findData();
const process = maybe(create, update, maybeRecord);

process(input);




const database = {
  0: {name:'Drew'}
};

const newRecord = data => {
  database[1] = data;
  return data;
};

const findData => id => database[id] ? Just(database[id]) : Nothing;

const create = data => newRecord(data);
const update = record => data => ({data: {name:data.name}, iat: Date.now()});

const maybeRecord = findData(4);
const process = maybe(create, update, maybeRecord);

process(4);
*/
},{"../src/other-types/Task.js":20,"../src/other-types/pointfree.js":29}],5:[function(require,module,exports){
const {Maybe, Nothing, Just} = require('../../src/Maybe.js');

const createVideo = videoURL => {

  console.log('creating video w/',videoURL);

  var video = document.createElement('video');

  video.addEventListener('error', e => {
    console.log('video play error', e, video.error);
    Maybe.fromNullable(video.parentNode).map(x => x.removeChild(video));
  }, true);

  video.controls = false;
  video.className = 'grid-video';
  video.autoplay = false;
  video.muted = true;
  video.loop = true;
  video.width = 320;
  video.height = 240;

  video.src = videoURL;

  video.onloadedmetadata = function(e) {
    video.play();
  }

  return video;
};

const appendToBody = el => {
  document.body.appendChild(el);
  return el;
}

const appendToBodyThenPrepend = limit => el => {
  const videos = Array.from(document.querySelectorAll('video'));
  if(!videos.length){
    document.body.appendChild(el);
  }
  else if(videos.length<limit){;
    document.body.insertBefore(el, videos[0]);
  }else{
    const lastVideo = videos.slice(-1)[0];
    const src = lastVideo.src;
    
    document.body.removeChild(lastVideo);
    window.URL.revokeObjectURL(src);
    document.body.insertBefore(el, videos[0]);
  }
  return el;
}

const createMediaRecorder = stream => {
  let mediaRecorder;
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options.mimeType= 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options.mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options.mimeType= '';
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    console.error('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }

  mediaRecorder.onwarning = e => console.log('mr warning', e);

  return mediaRecorder;
};


const mrDataToBlobUrl = event => {
    return window.URL.createObjectURL(event.data);
};


const recordFromMRForMs = stream => recordForMS => {

  const mediaRecorder = createMediaRecorder(stream);

  let time = performance.now();

  console.log('preparing to record for', recordForMS);

  return new Promise((resolve, reject)=>{

    mediaRecorder.ondataavailable = event => {
      console.log('got data',mediaRecorder.state, event.data.size);
      if(event && event.data && event.data.size > 1){
        console.log('record time', performance.now()-time, 'now stopping');
        if(mediaRecorder.state === "recording"){
          mediaRecorder.stop();
        }
        resolve(event);
      }
    };

    mediaRecorder.onerror = e => !console.log('mr error', e) && reject(e);

    console.log(mediaRecorder.state,'mediaRecorder.state prerecord');

    mediaRecorder.start(recordForMS);

  });

};

const handleError = e => console.error('fatal error in chain',e);

const delay = milliseconds => x => new Promise(resolve => setTimeout(resolve, milliseconds, x));

const recordClips = number => stream => {
  const recordFor = time => recordFromMRForMs(stream)(time)
    .then(url=> !console.log(url) && url)
    .then(mrDataToBlobUrl)
    .then(createVideo)
    .then(delay(50))
    .then(appendToBodyThenPrepend(20));
  
  return Array.from({length:number}).reduce(
    P => P.then(_=>console.log('rec')).then(_ => recordFor(500)).then(delay(1000)), 
    Promise.resolve()
  ).catch(handleError);

};



const recordInfinite = duration => stream => {
  console.log('START INFINITE');
  return recordFromMRForMs(stream)(duration)
    .then(mrDataToBlobUrl)
    .then(createVideo)
    .then(delay(100))
    .then(appendToBodyThenPrepend(20))
    .then(_ => {
      console.log(_,'complete, starting next')
      return recordInfinite(duration)(stream);
    });
};



//closeStream :: Stream -> undefined
const closeStream = stream => {
  console.log('closing stream',stream);
  stream.getAudioTracks().forEach(track => track.stop());
  stream.getVideoTracks().forEach(track => track.stop());
}

//requestRecord :: Object (optional) -> Promise Stream
const requestRecord = (config={video:true, audio:true}) => {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 
    navigator.mediaDevices.getUserMedia(config).then(delay(1400)) ://extra delay at the start is to avoid the webcam flash
    Promise.reject('no support for getUserMedia');
};


// var muted = true;

// $('button').on('click',function(e){
//   $('video').get().forEach(function(v){
//     v.muted = !v.muted;
//   });
//   $(this).toggleClass('unmuted',muted);
//   muted = !muted;
// });


module.exports = {
  appendToBody,
  createVideo,
  mrDataToBlobUrl,
  createMediaRecorder,
  requestRecord,
  recordFromMRForMs,
  recordInfinite,
  closeStream,
  recordClips
};

//single cycle
//requestRecord().then(stream => recordFromMRForMs(createMediaRecorder(stream))(6900).then(mrDataToBlobUrl).then(createVideo).then(appendToBody).then(_=>closeStream(stream)))

// document.body.innerHTML = '';
// requestRecord().then(stream => {
//   recordClips(3000)(stream)
//     .then(_=>closeStream(stream))
// });

// document.querySelectorAll('video').forEach(function(v){
//   v.muted = !v.muted;
// });

document.querySelectorAll('button')[1].addEventListener('click',function(){
  document.body.innerHTML = '';
  requestRecord().then(stream => {
    recordInfinite(3000)(stream);
  });
});

},{"../../src/Maybe.js":4}],6:[function(require,module,exports){
Array.empty = _ => [];
Array.prototype.empty = Array.empty;
Array.prototype.flatten = function(){return [].concat(...this); };
//we need to guard the f against the extra args that native Array.map passes to avoid silly results
Array.prototype.chain = function(f){
  return this.map(x=>f(x)).flatten();
};
Array.prototype.ap = function(a) {
  return this.reduce( (acc,f) => acc.concat( a.map(f) ), []);//also works, & doesn't use chain
};
Array.prototype.flap = function(a) {
  return a.reduce( (acc,f) => acc.concat( this.map(f) ), []);//also works, & doesn't use chain
};


Array.prototype.sequence = function(point){
    return this.reduce(
      function(acc, x) {
        return acc
          .map(innerarray => othertype => innerarray.concat(othertype) )//puts this function in the type
          .ap(x);//then applies the inner othertype value to it
      },
      point([])
    );
};
//from fantasyland: https://github.com/safareli/fantasy-land/blob/98e363427c32a67288d45063b0a5627b912ee8b6/internal/patch.js#L13
//do these use the reversed .ap?
Array.prototype.flsequence = function(p) {
  return this.reduce(
    (ys, x) => ys.ap(x.map(y => z => z.concat(y))),
    p([])
  );
};
Array.prototype.fltraverse = function(f, p) {
  return this.map(f).reduce(
    (ys, x) => ys.ap(x.map(y => z => z.concat(y))),
    p([])
  );
};



Array.prototype.extend = function(exfn){
  return this.map((x,i,arr) => exfn(arr.slice(i)));//passes current item + the rest of the array
}

Array.prototype.extendNear = function(exfn){
  const len = this.length;
  return this.map((x, i ,arr) => {
    const slice = arr.slice(Math.max(i-1,0),i+2);
    if(i===0){
      slice.unshift(arr[len-1]);
    }else if(i===len){
      slice.push(arr[0]);
    }
    return exfn(slice)
  });//passes nearby prev/next values
}

Array.prototype.extract = function(){
  return this[0];
}


Array.prototype.traverse = function(f, point){
    return this.map(f).sequence(point);
};





// implementation of Array.chainRec
const stepNext = x => ({value: x, done: false });
const stepDone = x => ({value: x, done: true });

Array.chainRec = function _chainRec(f, i) {
  var todo = [i];
  var res = [];
  var buffer, xs, idx;
  while (todo.length > 0) {
    xs = f(stepNext, stepDone, todo.shift());
    buffer = [];
    for (idx = 0; idx < xs.length; idx += 1) {
      (xs[idx].done ? res : buffer).push(xs[idx].value);
    }
    Array.prototype.unshift.apply(todo, buffer);
  }
  return res;
};


//now begins silliness

//int range
Array.range = (limit, start=0) => Array.chainRec(function(next, done, x) {
  if(start>limit){
    throw new Error('you are dumb');//this should be externalized so that it only runs once
  }
  return (x === limit) ? [done(x)] : [done(x), next(x+1)]
}, start);

Array.weirdUnfold = (start, step, limit) => Array.chainRec(function(next, done, x) {
  return (limit(x)) ? [done(x)] : [done(x), next(step(x))]
}, start);


/*
Array.chainRec(function(next, done, x) {
  return (x == 10) ? [done(x)] : [done(x), next(x+1)]
}, 0) // [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
*/


},{}],7:[function(require,module,exports){
//https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch8.html#a-spot-of-theory

const {map, chain}  = require('../../src/other-types/pointfree.js');

//is this a poor-man's FunctorT interface? Yep. TypeT interfaces are more powerful, this works tho
const Compose = function(f_g_x) {
  if (!(this instanceof Compose)) {
    return new Compose(f_g_x);
  }
  this.decompose = f_g_x;
};

Compose.prototype.map = function(f) {
  return new Compose(map(map(f), this.decompose));
};
Compose.prototype.mapChain = function(f) {
  return new Compose(map(chain(f), this.decompose));
};
Compose.dec = C => C.decompose;

module.exports = Compose;


/* 

FL version at https://github.com/fantasyland/fantasy-land#traversable

var Compose = function(c) {
  this.c = c;
};

Compose.of = function(x) {
  return new Compose(F.of(G.of(x)));
};

Compose.prototype.ap = function(x) {
  return new Compose(this.c.map(u => y => u.ap(y)).ap(x.c));
};

Compose.prototype.map = function(f) {
  return new Compose(this.c.map(y => y.map(f)));
};

*/
},{"../../src/other-types/pointfree.js":29}],8:[function(require,module,exports){
function Const(value) {
  if (!(this instanceof Const)) {
    return new Const(value);
  }
  this.x = value;
}
Const.of = x => new Const(x);

//fantasy-const defines this but not entirely sure the logic behind it
Const.prototype.concat = function(y) {
    return new Const(this.x.concat(y.x));
};
//so, since Const "hides" a real value behind an ignored value, concat is actually going to concat the inner, hidden values behind the scenes.

Const.prototype.ap = function(fa) {
    return this.concat(fa);//concats inner values instead of running function: the function is the "ignored" outer here
};

Const.prototype.map = function() {
  return this;
};

Const.prototype.extract = function() {
  return this.x
};

module.exports = Const;

/*

  reduce is then 
  .prototype = function(f, acc) {
    const thisAcc = x => Const(acc);
    Const.prototype.ap = function(b) {
      return new Const(f(this.x, b.x));
    };
    return this.map(x => new Const(x)).sequence(thisAcc).x; 
  }

*/
},{}],9:[function(require,module,exports){
//lots of similarities here to Task and Reader
//fork and handler are very similar: computation doesn't run until fork is called
//https://gist.github.com/tel/9a34caf0b6e38cba6772
function Continuation(fork) {
  if (!(this instanceof Continuation)) {
    return new Continuation(fork);
  }
  this.fork = fork;
};

Continuation.of = function(value) {
  return new Continuation(resume => resume(value));
};

Continuation.prototype.chain = function(fn) {
  return new Continuation(resume => this.fork(value => fn(value).fork(resume)) );
};

// Continuation.prototype.map = function (fn) {
//   return new Continuation(resume => this.fork(b => resume(fn(b)) ) );
// };
Continuation.prototype.map = function (fn) {
  return this.chain(v => Continuation.of(fn(v)) );
};

Continuation.prototype.ap = function(app2) {
  return this.chain(fn => app2.chain(app2value => Continuation.of(fn(app2value)) ) );
};

Continuation.ask = Continuation(x=>x);

Continuation.fill = value => Continuation.ask.map(resume => resume(value)).fork();

Continuation.prototype.fork = function(resume) {
  return this.fork(resume);
};

Continuation.prototype.run = Continuation.prototype.fork;

Continuation.prototype.escape = function() {
  return this.fork(x=>x);
};

Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.fork(value => resume(value)) );
};
//or?
Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.fork(resume) );
};





const Cont = Continuation;//alias

module.exports = Continuation;


//monad for specifying the value transformation last maybe?  the value is a "resuming" function
//https://gist.github.com/tel/9a34caf0b6e38cba6772
//http://www.haskellforall.com/2012/12/the-continuation-monad.html for when you want to write a computation that specifies some critical operation later/externally?
/*
Whoa:
Our strategy works well if we have exactly one hole in our function, but what if we have two holes in our function, each of which takes a different argument?
Fortunately, there is a clean and general solution. Just define a data type that wraps both possible arguments in a sum type, and just define a single continuation that accepts this sum type:
//The continuation monad teaches us that we can always condense a sprawling API filled with callbacks into a single callback that takes a single argument.
*/

/*
function unit(a) {
    return function(k) {
        return k(a);
    };
}

function bind(ma, f) {
    return function(k) {
        return ma(function(a) {
            return f(a)(k);
        });
    };
}

function doCont() {
    var args = Array.prototype.slice.apply(arguments);
    return function(k) {
        var f = args.shift();
        while (args.length > 0) {
            f = bind(f, args.shift());
        }
        return f(k);
    };
}

function call_cc(f) {
    return function(a) {
        return function(k) { return f(a, k); };
    };
}

function lift(f) {
    return call_cc(function(a, k) { return k(f(a)); });
}

function addEachOf() {
    var args = arguments;
    return call_cc(function(a, k) {
        var i;
        for (i=0; i<args.length; i++) {
            k(a + args[i]);
        }
    });
}

function alertMe(message) { alert(message); }

doCont(
    unit("goodbye cruel "),
    addEachOf("world", "fate", "mistress"),
    lift(function(a) { return a.toUpperCase(); })
)(alertMe);

*/
},{}],10:[function(require,module,exports){
const {I}  = require('../../src/other-types/pointfree.js');

function Coyoneda(x, fn) {
  if (!(this instanceof Coyoneda)) {
    return new Coyoneda(x, fn);
  }
  Object.assign(this, {x,fn});
}

Coyoneda.prototype.map = function(f){
    return Coyoneda(this.x, (...args) => f(this.fn(...args)) );
};

Coyoneda.prototype.contramap = function(f){
    return Coyoneda(this.x, compose(this.fn, f));
};

Coyoneda.prototype.dimap = function(f, g){
    return Coyoneda(this.x, compose(g, this.fn, f));
};

//if the value actually has a native map method...
Coyoneda.prototype.lower = function(){
    return this.x.map(this.fn);
};

//if not, but it has an inner value at .x
Coyoneda.prototype.run = function(){
    return this.fn(this.x);
};

Coyoneda.lift = x => Coyoneda(x, I);

module.exports = Coyoneda;

},{"../../src/other-types/pointfree.js":29}],11:[function(require,module,exports){
const {curry, compose, K, I, head, tail}  = require('../../src/other-types/pointfree.js');

function Either(...args){
  switch (args.length) {
    case 0:
      throw new TypeError('no left value: consider using Maybe');
    case 1:
      return function(right) {
        return right == null ? Left(args[0]) : Right(right);
      };
    default:
      return args[1] == null ? Left(args[0]) : Right(args[1]);
  }
}

const Left = function(x){
  if (!(this instanceof Left)) {
    return new Left(x);
  }
  this.l = x;//storing the value in the instance
};

Left.prototype = Object.create(Either.prototype);

const Right = function(x){
  if (!(this instanceof Right)) {
    return new Right(x);
  }
  this.r = x;//storing the value in the instance
};

Right.prototype = Object.create(Either.prototype);

//let's use the cata interface for most of the others
Left.prototype.cata = function({Left}){ return Left(this.l) };
Right.prototype.cata = function({Right}){ return Right(this.r) };

Right.prototype.concat = function(e) {
  return e.cata({
    Left: l => e,
    Right: r => Right(this.r.concat(r))
  });
};

Left.prototype.concat = function(e) {
  return e.cata({
    Left: l => Left(this.l.concat(l)),
    Right: r => this
  });
};

Either.prototype.fold = function(f, g) {
  return this.cata({
    Left: f,
    Right: g
  });
};

Either.prototype.toString = function() {
  return this.cata({
    Left: l => `Left[${l}]`,
    Right: r => `Right[${r}]`
  });
};


Either.prototype.swap = function() {
    return this.fold(
        Right,
        Left
    );
};

Either.prototype.orElse = function(f) {
    return this.fold(
        l => (typeof f !== "function") ? Right(f(l)) : Right(f),
        r => this
    );
};

Either.prototype.merge = function(f) {
    return this.fold(I,I);
};

Either.prototype.chain = function(f) {
  return this.fold(K(this), f);
};

Either.prototype.map = function(f) {
  return this.chain( a => Either.of(f(a)) );
};

Either.prototype.ap = function(A) {
    return this.chain(f => A.map(f));
};


///???
Either.prototype.sequence = function(p) {
    return this.traverse(I, p);
};
Either.prototype.traverse = function(f, p) {
    return this.cata({
        Left: l => p(Left(l)),//is this right???
        Right: r => f(r).map(Right)
    });
};

Either.prototype.bimap = function(f, g) {
  return this.fold(
    l => Left(f(l)), 
    r => Right(g(r))
  );
};

Either.try = f => (...args) => {
  try{
    return Right(f(...args));
  }
  catch(e){
    return Left(e);
  }
};

Either.of = x => new Right(x);
Either.fromNullable = x => (x != null) ? Right(x) : Left();

Either.safeHead = compose(Either.fromNullable, head);//safehead, which is a natural transformation
Either.safeTail = compose(Either.fromNullable, tail);//safehead, which is a natural transformation

Either.isEmpty = xs => Array.isArray(xs) && xs.length ? Right(xs):Left([]);

Either.fromPredicate = curry(
  (fn, x) => fn(x) ? Right(x) : Left(x)
);
Either.fromFilter = Either.fromPredicate;

Either.either = curry((leftFn, rightFn, E) => {
  if(!(E instanceof Either)){
    throw new TypeError('invalid type given to Either.either');
  }
  return E.cata({
    Right: r => rightFn(r),
    Left: l => leftFn(l)
  })
});


const isArrayString = x=>/\[\d\]/.test(x);

const objOrArray = pathComponent => 
  Either.fromPredicate(isArrayString, pathComponent)
    .fold(I,x=>x.replace(/\[\]/g))

//users.0.name
const getPath = (paths, obj) => 
  paths.reduce(
    (eobj, pathC) => eobj.chain(o=>Either.fromNullable(o[pathC])), 
    Either.of(obj)
  ).fold(x=>undefined, I)

const splitPath = arg => 
  Either.fromPredicate(x=>typeof x === "string", arg)
    .fold(I, x=>x.split('.'));


Either.get = curry(
  (pathOrPathString, obj) => getPath(splitPath(pathOrPathString), obj)
)

module.exports = {
  Either,
  Left,
  Right
};
},{"../../src/other-types/pointfree.js":29}],12:[function(require,module,exports){
//because functions need help too

const {S}  = require('../../src/other-types/pointfree.js');

    //Baby's First Reader
    Function.of = x => _ => x;
    // Function.prototype.join = function(){
    //     ???
    // }
    Function.prototype.map = function(f) {
        return x => f(this(x));//just composition
    }
    //chain for functions allows you to sub in a function that takes two arguments, effectively having a value get transformed by the monad for the first argument, then also passed in again clean as the second
    //head.chain(append) -> [3,4,5] -> [3,4,5,3]
    //(a -> (x -> b)) -> (x -> a) -> (x -> b)
    //put another way, we can glue a->x and x -> a -> b together, for the same a
    Function.prototype.chain = function(f) {
        return x => f(this(x))(x)//supposedly this is akin to the reader monad?
    }

  //function version
  // if (typeof monad === 'function') {
  //   return function(x) { return fn(monad(x))(x); };
  // }



    //const isTwo = a => a===2
    //const notTwo = isTwo.map(x=>!x)

    //S NEEDS to be curried here for this to work
    Function.prototype.ap = function(f) {
        return S(this)(f);// equivalent to returning x => this(x)(f(x))
    }

    Function.prototype.contramap = function(f) {
        return x => this(f(x));//composition in reverse order
    }
    //const isOne = isTwo.contramap(x=>x+1)

    //have to think about the order of arguments
    Function.prototype.dimap = function(c2d, a2b) {
        return x => c2d( this( a2b(x) ) );//or, compose(c2d, this,a 2b)
    }
    //notOne = isTwo.dimap(x=>!x, x=>x+1)

    Function.prototype.dimap = function(c2d, a2b) {
        return this.contramap(a2b).map(c2d);
    }
},{"../../src/other-types/pointfree.js":29}],13:[function(require,module,exports){
const Task  = require('../../src/other-types/Task.js');

const logFn = fn => {
  if(fn.name){
    return fn.name
  }else{
    let stringFn = fn.toString().replace(/\s\s+/g, ' ');
    return stringFn.length>20 ?
      `(${stringFn.replace(/(=>)(.*)/, "$1 ...")})` :
      `(${stringFn})`
  }
};

function IO(fn, annotation) {
  if (!(this instanceof IO)) {
    return new IO(fn, annotation);
  }
  this.runIO = fn;//IO creates an extra control layer above a function
  this.computation = annotation ? annotation : logFn(fn);
}

IO.of = IO.prototype.of = x => IO(_=>x, `() => ${x}`);//basically the same as IO(K(x))

IO.prototype.chain = function(f) {
  return IO(_ => f(this.runIO()).runIO() , `${this.computation} |> ${logFn(f)}`);
};
//operations sequenced in next stack?
IO.prototype.fork = function() {
  return IO(_ => new Promise( r => window.setTimeout(()=>r(this.runIO()),0) ));
};

IO.prototype.ap = function(a) {
  return this.chain( f => a.map(f));
};

IO.prototype.map = function(f) {
  return new IO(_=>f(this.runIO()), `${this.computation} |> ${logFn(f)}`);
};

//???? parallel effects?
IO.prototype.parallel = function(i) {
  return IO(_=> { this.runIO(); i.runIO(); });
};
IO.prototype.concat = function(i) {
  return IO(_=> this.runIO().concat(i.runIO()) );
};



IO.prototype.toTask = function(f) {
  return new Task((rej, res) => res(this.runIO()));
};

//?unproven/maybe not possible?
// IO.prototype.sequence = function(of) {
//   return of(IO.of).ap(of(this.runIO()));
// };

//makes a -> IO b
//(a->b) -> a=>IO(_->(a->b)(a)))...
IO.lift = fn => (...args) => IO(_=>fn(...args));

//nts from arrays of fns that create IOs to IO of effects
//takes a
IO.effectsToIO = xs => (...args) => xs.map(IO.lift).map(fn=>fn(...args)).sequence(IO.of);
//lists of arguments to apply to list of functions
IO.effectsToIO2 = fnxs => argsxs => argsxs.flap(fnxs.map(IO.lift)).sequence(IO.of);
//combining only nullary IO effects (those that don't require arguments)
IO.effectsToIONull = xs => xs.map(IO.lift).sequence(IO.of);


//String->IO[Array]
IO.$ = selectorString => new IO(_ => Array.from(document.querySelectorAll(selectorString)));

IO.$id = idString => new IO(_ => document.getElementById(idString));

//IO :: String -> String -> DOMNode -> IO DOMNode
IO.setStyle = (style, to) => node => new IO(_ => { node.style[style] = to; return node;}  );
IO.setAttr = (attr, to) => node => new IO(_ => { node.setAttribute(attr,to); return node;}  );
//IO.$('#email').map(head).chain(IO.setAttr('data-filk','hi')).runIO()
const getNodeChildren = node => Array.from(node.children);


module.exports = IO;


/*

  const revealInitialStep = step => Array.of(step).flap([
    advanceBackground({initial:true}),
    _revealStep({initial:true})
  ].map(IO.lift)).sequence(IO.of);


*/
},{"../../src/other-types/Task.js":20}],14:[function(require,module,exports){
const {I}  = require('../../src/other-types/pointfree.js');

function Identity(v) {
  if (!(this instanceof Identity)) {
    return new Identity(v);
  }
  this.x = v;
}

Identity.prototype.of = x => new Identity(x);
Identity.of = Identity.prototype.of;
Identity.prototype.toString = function() {
  return `Identity[${this.x}]`
};
Identity.prototype.map = function(f) {
  return new Identity(f(this.x));
};
Identity.prototype.fold = function(f) {
  return f(x);
};
Identity.prototype.ap = function(ap2) {
  return ap2.map(this.x);
};
Identity.prototype.flap = function(ap2) {
  return new Identity(ap2.x(this.x));
};
Identity.prototype.ap2 = function(b) {
  return new Identity(b.x(this.x));
};


Identity.prototype.sequence = function(of){
  return this.x.map(Identity.of);//we use sequence when an inner type exists that has a map method, so returning it with ITS value wrapped in Id is sufficient
};
Identity.prototype.traverse = function(f, of){
  return this.map(f).sequence(of);//transform, then sequence
};

//same result, different derivation
Identity.prototype.traverse2 = function(f, of){
  return f(this.x).map(Identity);
};
Identity.prototype.sequence2 = function(of){
  return this.traverse(I);
};




//fold and chain are the same thing for Identity!
Identity.prototype.chain = 
Identity.prototype.fold = function(f) {
  return f(this.x);
};
Identity.prototype.reduce = function(f, acc) {
  return f(acc, this.x);
};
Identity.prototype.equals = function(that){
  return that instanceof Identity && that.x === this.x;
};

//comonad
Identity.prototype.extend = function(f) {
  return Identity(f(this));//function is given the entire type, returns a regular value, which is put back in the type
};
Identity.prototype.flatten = Identity.prototype.extract = function(){
  return this.x;
};
Identity.prototype.duplicate = function(){
  return this.extend(I)
};

//chainRec
Identity.prototype.chainRec = function(f, i) {
    let state = { done: false, value: i};
    const next = v => ({ done: false, value: v });
    const done = v => ({ done: true, value: v });
    while (state.done === false) {
      state = f(next, done, state.value).extract();
    }
    return Identity.of(state.value);
};
Identity.chainRec = Identity.prototype.chainRec;
//Identity.chainRec((next, done, x) => x === 0 ? Identity.of(done(x)) : Identity.of(next(x - 1)), 5)

module.exports = Identity;
},{"../../src/other-types/pointfree.js":29}],15:[function(require,module,exports){
Promise.of = Promise.prototype.of = x => Promise.resolve(x);
Promise.prototype.map = Promise.prototype.chain = Promise.prototype.bimap = Promise.prototype.then;
//Promise.prototype.fold = Promise.prototype.then;//is it really? 
//Yes: Promise.reject(9).fold(x=>acc+1, x=>x+1)->P10 Promises hold only one value
//not sure if tasks turn reject into a resolve like this tho

//I think this might still be correct, maybe?
Promise.prototype.ap = function(p2){
  return Promise.all([this, p2]).then(([fn, x]) => fn(x));
}

Promise.prototype.bimap = function(e,s){
  return this.then(s).catch(e);
};

// Promise.prototype.ap = function(p2){
//   return [this,p2].sequence(Promise.of).then(([fn, x]) => fn(x));
// }

//create a Promise that will never resolve
Promise.empty = function _empty() {
  return new Promise(function() {});
};

//delegates to how race works: the first resolving OR rejecting wins
Promise.prototype.concat = function(that){
 return Promise.race([this,that]);
};

//the first _resolving_ promise wins, otherwise the first rejecting
Promise.prototype.hopefulConcat = function(that){
  return Promise.race([this,that]).catch(
  e => {
    let resolved = {};
    return this.then(a=>{
      resolved = this;
      return a;
    },b=>{
      return that.then(c=>{
        resolved = that;
        return c;
      });
    }).then(x=> resolved.then ? resolved : Promise.reject(e), x=>Promise.reject(e));
  });
};

//just a reduce using concat2, takes the first to resolve, or first to reject once all have rejected
Promise.prototype.enterChallengers = function(arr){
  return arr.reduce((acc,x) => acc.hopefulConcat(x), this);
}


//???? just copied over from Task
Promise.prototype.orElse = function _orElse(f) {
  return new Promise(function(resolve, reject) {
    return this.then(null,function(a) {
      return f(a).then(resolve, reject);
    });
  });
};

},{}],16:[function(require,module,exports){
const {invoke}  = require('../../src/other-types/pointfree.js');


function Reader(run) {
  if (!(this instanceof Reader)) {
    return new Reader(run);
  }
  this.run = run;
}

Reader.prototype.toString = function(a) {
  return `a => ${this.run}(a)`;
};

Reader.prototype.chain = function(f) {
  return new Reader( r => f(this.run(r)).run(r) );
};

Reader.prototype.ap = function(a) {
  return this.chain( f => a.map(f) );
};
Reader.prototype.flap = function(a) {
  return a.chain( f => this.map(f) );
};

Reader.prototype.map = function(f) {
  return this.chain( a => Reader.of(f(a)) );
};
Reader.prototype.contramap = function(f) {
  return this.chain( a => Reader.of(f(a)) );
};

//no, and probably not actually possible or desirable: Reader wants to be externalized, not swapped inside anything
Reader.prototype.traverse = function(of, f){
  return Reader.of(x=>of(this)).ap(this).run()
}
Reader.prototype.sequence = function(of){
  return this.traverse(of, x=>x);
}

Reader.prototype.of = function(a) {
  return new Reader( _ => a );
};
Reader.of = Reader.prototype.of;

//ask allows you to inject the/a runtime depedency into a computation without needing to specify ahead of time what it is
Reader.ask = Reader(x=>x);
//it's super tricky when you think about how it works, because you're mapping over the value inside ask to get at it, but because it's just a passthrough func, and it's used inside a chain, you're basically exiting out of the inner value and substituting in the run() value. The layer you're working on is removed and the passthrough is left inside. The inner value only survives if it's passed into that new structure!

//With Reader.ask, you're basically creating a fresh Reader with a function inside that passes through the new end value: you have to map over it to combine it with the previous value

//silly helpers
Reader.binary = fn => x => Reader.ask.map(y => fn(y, x));//specify a binary function that will call run's(y) and x, running the function as if both values were magically summoned and then returning an output
Reader.binaryC = fn => x => Reader.ask.map(y => fn(y)(x));//specify a CURRIED binary function that will call run's(y) and x, running the function as if both values were magically summoned and then returning an output
Reader.exec = x => Reader.ask.map(fn => fn(x));//for single functions
Reader.execer = R => R.chain(Reader.exec);//for single functions, baking in chain
Reader.invoke = methodname => x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x));//for interfaces w/ named methods
Reader.invoker = methodname => R => R.chain(x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x)));//for interfaces w/ named methods, baking in the chain
Reader.run = R => R.run;//can be used inline in a composition to expose the run function as the callable interface


Reader.ReaderT = M => {
    function ReaderT(run) {
      if (!(this instanceof ReaderT)) {
        return new ReaderT(run);
      }
      this.run = run;
    }

    ReaderT.lift = m => ReaderT(constant(m));

    ReaderT.of = a => ReaderT(e => M.of(a));

    ReaderT.ask = ReaderT(e => M.of(e));

    ReaderT.prototype.chain = function(f) {
        return ReaderT(e => this.run(e).chain(a => f(a).run(e)));
    };

    ReaderT.prototype.map = function(f) {
      return this.chain(a => ReaderT.of( f(a) ) );
    };

    ReaderT.prototype.ap = function(a) {
      return ReaderT(e => this.run(e).ap(a.run(e)));
    };

    return ReaderT;
};




module.exports = Reader;

//really useful case: pass an interface in later on
//Reader.of(6).chain(x=>Reader.ask.map(lib=>lib.increment(x))).run({increment:x=>x+1});

//invoke a method on an interface to be passed in later!
//Reader.of(6).chain(Reader.invoke('increment')).run({increment:x=>x+1})
//compose(map(x=>x*2), Reader.invoker('transform'), map(x=>x+1), Reader.of)(9).run({transform:x=>x+6})


//I think when I first heard that Reader "summons the environment out of thin air" I got a burrito-metaphor-level wrong understanding of it.  When you Reader.of(9).chain(x=>R.ask.map(...)) you could equally well say that you're summoning the "9" out of thin air into a new Reader.  Heck, if you don't actually use x in the ..., it's completely discarded and has no actual effect on the computation from then on.


//Reader.of(9).run(9);//-> 9
//the run value isn't used/has no effect on anything. .of(x) creates the function _ => x, Reader basically works like the Constant Combinator here

//Reader(x=>x+1).run(9);//-> 10, 
//here Reader explicitly is given and holds a function, so calling run is _exactly_ like just running the fn with the value

//Reader(x=>x+1).map(x=>x*2).run(1);//-> 4 (and NOT 3, as it would be if x=>x*2 came first)
//mapping over a Reader is just a form of function composition, working left to right

//Reader.of(9).map(x=>x+1).run(500);//-> 10
//but again, remember that .of(9) creates () => 9, so the run value never makes it through/has any effect: it's discarded. All that's left is the composition of the functions:
//compose(x=>x+1, ()=>9)(500);//-> 10

//we can do composition on our own though, so what is reader good for? Weaving dependencies into computations:

//Reader.of(1).chain(x=>Reader.ask.map(y=>x+y)).run(2);//-> 3

//What's going on there is pretty wild:


//Reader -> _ => 1 ------------v
//          Reader x=>x . x=>x+1 (where x is going to be the eventual run value)

//So it's taking a Reader with a function that returns a constant value and will always ignore its environment, opening up the Reader's "value" with chain, and swapping it out for a Reader that WILL listen for its environment when run, and pulling the value from the first into the scope of a function run in the second.  Or something.  It's mind-bending.  People have described Reader's ask as "summoning" the outer environment from thin air, but while that's probably how you should end up thinking about it for simplicity/coolness, that's not quite right.  The trick behind it is more about just forcing two Readers together with both of them ripped open at the normally unexposed ends.

//ok, but couldn't we already do this via partial application?  
//const add = x => y => x+y;
//add(1)


//Sure... but you can't .map() over the value in add(1), can you?  It's already fully baked into the resulting function.  More to the point, you want to be able to write simple functions that don't make big assumptions about a particular environment or resource.  For instance, consider a pesistent db connection. You don't want to create that early or create it every time you need to do something.  You want to be able to pass in a reference to it at the last second: at runtime.  But if the operation itself has lots of different usages and references to it, you need a way to bake in that same reference throughout the composition without using lots of complex closures. In fact, Reader IS the functional version of a closure where, instead of things being just pulled willy-nilly out of an outer scope, it's explicit.  The computation has explicit references (via Reader utilities) reaching out to some eventual runtime environment, and then when the outer context is ready to add in, those connections are linked up.

//

//Reader(x=>x+1).run(9);//-> 10
},{"../../src/other-types/pointfree.js":29}],17:[function(require,module,exports){
const {I, getInstance}  = require('../../src/other-types/pointfree.js');

function RemoteData(){
  throw new TypeError('Constructor cannot be called directly');
}

const NotAsked = function(){
  if (!(this instanceof NotAsked)) {
    return new NotAsked();
  }
};

const Requested = function(r){
  if (!(this instanceof Requested)) {
    return new Requested(r);
  }
  this.x = r;//resource pointer
};
const Loading = function(l){
  if (!(this instanceof Loading)) {
    return new Loading(l);
  }
  this.x = l;//request meta data
};
const Failure = function(e){
  if (!(this instanceof Failure)) {
    return new Failure(e);
  }
  this.x = e;//error type
};
const Success = function(s){
  if (!(this instanceof Success)) {
    return new Success(s);
  }
  this.x = s;//expected type
};

const subtypes = [NotAsked,Requested,Loading,Failure,Success];

subtypes.forEach(type=>{
  type.prototype = Object.create(RemoteData.prototype);
  type.prototype.name = type.name;
  RemoteData[type.name] = type;
  RemoteData.prototype[`if${type.name}`] = function(f){
    return this.name===type.name? f(this.x) : this;
  }
});

RemoteData.NotAsked = NotAsked();//only ever need the one instance

RemoteData.of = x => Success(x);

RemoteData.prototype.cata = function(dispatches){
  console.log(`name: ${typeof this}`)
  return dispatches[this.name](this.x);
}

RemoteData.prototype.chain = function(f){
  return this.cata({
    NotAsked: _=>this,
    Requested: _=>this,
    Loading: _=>this,
    Failure: _=>this,
    Success: s => f(s)
  })
}

RemoteData.prototype.fold = function(lf,ef,sf){
  return this.cata({
    NotAsked: _=>null,
    Requested: _=>null,
    Loading: _=>lf(this.x),
    Failure: _=>ef(this.x),
    Success: _=>sf(this.x)
  })
}

RemoteData.prototype.map = function(f){
  return this.chain(x=>Success.of(f(x)));
} 

module.exports = RemoteData;
},{"../../src/other-types/pointfree.js":29}],18:[function(require,module,exports){
const {curry}  = require('../../src/other-types/pointfree.js');

var Identity = require('./Identity');
var Tuple = require('./Tuple');
var {deriveAp, deriveMap} = require('./utility');


function T(M) {
  function StateT(run) {
    if (!(this instanceof StateT)) {
      return new StateT(run);
    }
    this._run = run;
  }
  StateT.prototype.run = function(s) {
    return this._run(s);
  };
  StateT.prototype.eval = function(s) {
    return Tuple.fst(this.run(s));
  };
  StateT.prototype.exec = function(s) {
    return Tuple.snd(this.run(s));
  };
  StateT.prototype.chain = function(f) {
    var state = this;
    return StateT(function(s) {
      return state._run(s).chain(function(t) {
        return f(Tuple.fst(t))._run(Tuple.snd(t));
      });
    });
  };
  StateT.of = StateT.prototype.of = function(a) {
    return StateT(function (s) {
      return M.of(Tuple(a, s));
    });
  };
  StateT.prototype.ap = deriveAp(StateT);
  StateT.prototype.map = deriveMap(StateT);
  StateT.tailRec = curry(function(stepFn, init) {
    return StateT(function(s) {
      return M.tailRec(function(t) {
        return stepFn(Tuple.fst(t))._run(Tuple.snd(t)).chain(function (t_) {
          return M.of(Tuple.fst(t_).bimap(
            function(a) { return Tuple(a, Tuple.snd(t_)); },
            function(b) { return Tuple(b, Tuple.snd(t_)); }
          ));
        });
      }, Tuple(init, s));
    });
  });
  StateT.lift = function(ma) {
    return StateT(function(s) {
      return ma.chain(function(a) {
        return M.of(Tuple(a, s));
      });
    });
  };
  StateT.get = StateT(function(s) {
    return M.of(Tuple(s, s));
  });
  StateT.gets = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(f(s), s));
    });
  };
  StateT.put = function(s) {
    return StateT(function(_) {
      return M.of(Tuple(void _, s));
    });
  };
  StateT.modify = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(void 0, f(s)));
    });
  };

  return StateT;
}

var State = T(Identity);
State.T = T;
State.prototype.run = function(s) {
  return this._run(s).value;
};

module.exports = State;
},{"../../src/other-types/pointfree.js":29,"./Identity":14,"./Tuple":22,"./utility":30}],19:[function(require,module,exports){
//http://stackoverflow.com/questions/8766246/what-is-the-store-comonad
//very similar to lenses in some way: it's a getter/setter focused on a particular external context
//lenses are, in fact, coalgebras of the store/costate monad
const Store = function(set, get){
  if (!(this instanceof Store)) {
    return new Store(set, get);
  }
  this.set = set;
  this.get = get;
};

// gets the value, and also ensures that it sets to whatever it got? Seems to extecute the action
Store.prototype.extract = function() {
    return this.set(this.get());
};

//alters the setter such that the result of f is what gets extracted
Store.prototype.extend = function(f) {
    return Store(
        k => f(Store( this.set, _ => k)),//mind-boggling? alters set to avoid mutating the original value?
        this.get//so extend can never change the getter, I guess?
    );
};

// Store(x=>t.foo=x,x=>t.foo).extend(st=>5).extract();//-> 5

// Store.prototype.extend2 = function(f) {
//     var self = this;
//     return Store(
//         (k) => {
//             return f(Store(
//                 self.set,
//                 () => k
//             ));
//         },
//         this.get
//     );
// };

// Derived
//maps over the eventually extracted value
Store.prototype.map = function(f) {
    return this.extend( _ => f(this.get()) );
};

//sets the value via some function that takes the value as input
Store.prototype.over = function(f) {
    return this.set(f(this.get()));
};

module.exports = Store;
},{}],20:[function(require,module,exports){


const logFn = fn => {
  if(fn.name){
    return fn.name
  }else{
    let stringFn = fn.toString().replace(/\s\s+/g, ' ');
    return stringFn.length>25 ?
      `(${stringFn.replace(/(=>)(.*)/, "$1 ...")})` :
      `(${stringFn})`
  }
};


// fn => Task fn
const Task = function(computation, annotation){
  if (!(this instanceof Task)) {
    return new Task(computation, annotation);
  }
  this.fork = (eh, sh) => {
    const result = computation(eh,sh);
    return typeof result === 'function' ? 
      result : 
      function _cancel(){ clearTimeout(result); };
  };
  // this.fork = (eh, sh) => {

  //   const result = computation(eh,sh);
  //   if(typeof result === 'function'){
  //     result.finally = fn => 
  //     return result
  //   }else{
  //     return function _cancel(){ clearTimeout(result); };
  //   }
  // };

  //just for fun
  this.computation = annotation ? annotation : logFn(computation);
};
//clear timeout stuff here is just for fun


Task.of = Task.prototype.of = x => new Task((a, b) => b(x), `=> ${x}`);


Task.rejected = x => new Task((a, b) => a(x), `rejected~> ${x}`);
Task.prototype.flog = function(){
  return this.fork(e=>console.error(e), x=>console.log(x))
}

Task.prototype.map = function map(f) {
  return new Task(
    (left, right) => this.fork(
      a => left(a),
      b => right(f(b))
    )
  , `${this.computation} |> ${logFn(f)}`);
};

Task.prototype.chain = function _chain(f) {
  return new Task(
    (left, right) => {
      let cancel;
      let outerFork = this.fork(
        a => left(a),
        b => {
          cancel = f(b).fork(left, right);
        }
      );
      return cancel ? cancel : (cancel = outerFork, x =>cancel());
    }
   ,`${this.computation} |> ${logFn(f)}`);
};

Task.prototype.ap = function _ap(that) {
  var forkThis = this.fork;
  var forkThat = that.fork;

  return new Task(function(reject, resolve) {
    var func, funcLoaded = false;
    var val, valLoaded = false;
    var rejected = false;

    var leftAp = forkThis(guardReject, guardResolve(function(x) {
      funcLoaded = true;
      func = x;
    }));

    var rightAp = forkThat(guardReject, guardResolve(function(x) {
      valLoaded = true;
      val = x;
    }));

    function guardResolve(setter) {
      return function(x) {
        if (rejected) {
          return;
        }

        setter(x);
        if (funcLoaded && valLoaded) {
          return resolve(func(val));
        } else {
          return x;
        }
      }
    }

    function guardReject(x) {
      if (!rejected) {
        rejected = true;
        return reject(x);
      }
    }

    return function _cancel(x){ 
      leftAp(); 
      rightAp()
    };
  }, `${this.computation} <*> ${that.computation}`);
};

//doesn't include cancelation
Task.prototype.orElse = function(f){
  return new Task(
    (left, right) => this.fork(
      a => right(f(a)),
      b => right(b)
    )
  );
}

Task.timeout = ms => Task((rej,res)=> setTimeout(res,ms),`_=>Task.timeout(${ms})`);

Task.liftWait = ms => x => Task((rej,res)=> setTimeout(_=>res(x),ms),`x=>Task.liftWait(${ms})`);


/*adapters*/

const taskify = promiseapi => (...args) => new Task((rej,res)=>promiseapi(...args).then(res).catch(rej));

const fetchTask = (...args) => new Task(function(reject, resolve){
  try{
    fetch(...args).then(x=>resolve(x)).catch(e=>reject(e));
  }catch(e){
    reject(e);
  }
});

Task.fetch = fetchTask;
Task.taskify = taskify;

//x=>x.json() -> Task.to('json')
Task.to = method => resource => new Task((rej,res) => resource[method]().then(res).catch(rej));

module.exports = Task;
},{}],21:[function(require,module,exports){
const {Any, Max}  = require('../../src/other-types/monoids.js');
const {foldMap}  = require('../../src/other-types/pointfree.js');

//straight from
//http://joneshf.github.io/programming/2015/12/31/Comonads-Monoids-and-Trees.html
//https://gitter.im/ramda/ramda?at=567c02983acb611716ffac24

function Tree(){}

const Leaf = function(val, ann){
  if (!(this instanceof Leaf)) {
    return new Leaf(val, ann);
  }
  Object.assign(this, {val, ann});
}
Leaf.prototype = Object.create(Tree.prototype);
Leaf.prototype.toString = function(){
  return ` Leaf(${this.val}, ${this.ann})`;
};
Leaf.prototype.map = function(f){
  return new Leaf(this.val, f(this.ann));
};
Leaf.prototype.extend = function(f){
  return new Leaf(this.val, f(Leaf(this.val, this.ann)));
};
Leaf.prototype.extract = function(){
  return this.ann;
};
Leaf.prototype.reduce = function(f, acc){
  return f(acc, this.ann);
};
Leaf.prototype.concat = function(l){
  return this.ann.concat(l.ann);
};
// Leaf : val -> ann -> Tree val ann
// function Leaf(val, ann) {
//   return {
//     ann: ann,
//     val: val,
//     toString: () => ` Leaf(${val}, ${ann})`,
//     map: f => Leaf(val, f(ann)),
//     extend: f => Leaf(val, f(Leaf(val, ann))),
//     extract: _ => val,
//     reduce: (f, acc) => f(acc, ann),
//   };
// }

const Branch = function(left, right, ann){
  if (!(this instanceof Branch)) {
    return new Branch(left, right, ann);
  }
  Object.assign(this, {left, right, ann});
}
Branch.prototype = Object.create(Tree.prototype);

Branch.prototype.toString = function(){
  return ` Branch(${this.ann}\n  ${this.left},\n  ${this.right}\n )`;
};
Branch.prototype.map = function(f){
  return new Branch(this.left.map(f), this.right.map(f), f(this.ann));
};
Branch.prototype.extend = function(f){
  return new Branch(this.left.extend(f), this.right.extend(f), f(Branch(this.left, this.right, this.ann)));
};
Branch.prototype.extract = function(){
  return this.ann;
};
Branch.prototype.reduce = function(f, acc){
  return this.right.reduce(f, this.left.reduce(f, f(acc, this.ann)));
};
Branch.prototype.concat = function(b){
  return this.ann.concat(b.ann);
};

Leaf.prototype._traverse = function(f, acc){
  return this.value;
};
Branch.prototype._traverse = function *(b){
  if(this.left) yield * this.left._traverse();
  yield this.value;
  if(this.right) yield * this.right._traverse();
};
Branch.prototype[Symbol.iterator] = function(){
  return this._traverse();
}



Branch.prototype.allAnnotations = function(b){
  return this.reduce((acc, x) => acc.concat(x), []);
};
Branch.prototype.hasChild = function(searchStr){
  return this.reduce((acc, x) => acc || (x===searchStr && x) || false, false);
};
Branch.prototype.findChild = function(searchStr){
  return this.extend(x=>x.ann);
};

// Branch : Tree val ann -> Tree val ann -> ann -> Tree val ann
// function Branch(left, right, ann) {
//   return {
//     ann: ann,
//     left: left,
//     right: right,
//     toString: () => ` Branch(${ann}\n  ${left},\n  ${right}\n)`,
//     map: f => Branch(left.map(f), right.map(f), f(ann)),
//     extend: f =>
//       Branch(left.extend(f), right.extend(f), f(Branch(left, right, ann))),
//     reduce: (f, acc) => right.reduce(f, left.reduce(f, f(acc, ann))),
//   };
// }

// changed : Tree val Bool -> Bool
const changed = tree => foldMap(Any, Any, tree).x;

const largest = tree => foldMap(Max, Max, tree).x;

const longestAnnotation = tree => tree.reduce((acc, x)=> acc.length>x.length? acc :x ,'');

//extend can modify "ann" without altering the underlying data, so that you can run an op on an extended structure as if it were a new tree without altering the old one at all!
//it's an immutable tree, in short

//this picks the right branch, then extends what the ann should be there by using the context of the entire branch to pick the rightside value.  Then extract returns this "updated" ann at that location.
//tree.right.extend(tr=>tr.right && tr.right.val).extract()


module.exports = {
  Leaf, Branch, changed, largest, longestAnnotation
};
},{"../../src/other-types/monoids.js":27,"../../src/other-types/pointfree.js":29}],22:[function(require,module,exports){
function Tuple(x, y) {
  if (!(this instanceof Tuple)) {
    return new Tuple(x,y);
  }
  this[0] = x;//log
  this[1] = y;//value
  this.length = 2;
}

Tuple.of = x => y => new Tuple(x, y);
Tuple.prototype.of = Tuple.of;

Tuple.prototype.map = function(f){
  return new Tuple( this[0], f(this[1]) );
}
Tuple.prototype.ap = function(wr){
  return Tuple( this[0].concat(wr[0]), this[1](wr[1]) );
}
Tuple.prototype.fst = function(){return this[0]};
Tuple.prototype.snd = function(){return this[1]};
Tuple.fst = tuple => tuple[0];
Tuple.snd = tuple => tuple[1];

Tuple.prototype.swap = function(){return Tuple(this[1],this[0])};


const Tupleize = Tuple.lift = (xval, yfn) => x => Tuple(xval, yfn(x));


//semigroup
Tuple.prototype.concat = function(wr){
  return Tuple( this[0].concat(wr[0]), this[1].concat(wr[1]) );
}
//allows merging of Tuples, as long as both the log and values are of the same semigroup.


//setoid
Tuple.prototype.equals = function(wr){
  return this[0]===wr[0] && this[1]===wr[1];
}

//???
Tuple.prototype.sequence = function(of){
  return of(this[1].chain(x=>Tuple(this[0],x)));
}

module.exports = Tuple;
},{}],23:[function(require,module,exports){
function Writer(l, v) {
  if (!(this instanceof Writer)) {
    return new Writer(l,v);
  }
  this[0] = Array.isArray(l)?l:[l];//log must be an array but we can be sloppy and convert it
  this[1] = v;//value
}

Writer.of = (x) => new Writer([], x);//[] is the "empty" type of array
Writer.prototype.of = Writer.of;

Writer.prototype.chain = function(f){
  const tuple = f(this[1]);
  return new Writer(this[0].concat(tuple[0]), tuple[1]);
}
Writer.prototype.map = function(f){
  return new Writer( this[0], f(this[1]) );
}
Writer.prototype.ap = function(wr){
  return Writer( this[0].concat(wr[0]), this[1](wr[1]) );
}
Writer.prototype.fst = function(){return this[0]};
Writer.prototype.snd = Writer.prototype.extract = function(){return this[1]};
Writer.prototype.swap = function(){return Writer(this[1],this[0])};


const writerize = Writer.lift = (log, fn) => x => Writer(log, fn(x));


//semigroup
Writer.prototype.concat = function(wr){
  return Writer( this[0].concat(wr[0]), this[1].concat(wr[1]) );
}
//allows merging of Writers, as long as both the log and values are of the same semigroup.


//setoid
Writer.prototype.equals = function(wr){
  return this[0]===wr[0] && this[1]===wr[1];
}


Writer.prototype.sequence = function(of){
  return of(this[1].chain(x=>Writer(this[0],x)));
}

module.exports = Writer;
},{}],24:[function(require,module,exports){

function getInstance(self, constructor) {
    return self instanceof constructor ? self : Object.create(constructor.prototype);
}
const constant = x=>_=>x;

/**
  ## `daggy.tagged(arguments)`
  Creates a new constructor with the given field names as
  arguments and properties. Allows `instanceof` checks with
  returned constructor.
  ```javascript
  const Tuple3 = daggy.tagged('x', 'y', 'z');
  const _123 = Tuple3(1, 2, 3); // optional new keyword
  _123.x == 1 && _123.y == 2 && _123.z == 3; // true
  _123 instanceof Tuple3; // true
  ```
**/
function tagged() {
    const fields = [].slice.apply(arguments);

    function toString(args) {
      const x = [].slice.apply(args);
      return () => {
        const values = x.map((y) => y.toString());
        return '(' + values.join(', ') + ')';
      };
    }

    function wrapped() {
        const self = getInstance(this, wrapped);
        var i;

        if(arguments.length != fields.length)
            throw new TypeError('Expected ' + fields.length + ' arguments, got ' + arguments.length);

        for(i = 0; i < fields.length; i++)
            self[fields[i]] = arguments[i];

        self.toString = toString(arguments);

        return self;
    }
    wrapped._length = fields.length;
    return wrapped;
}




/**
  ## `daggy.taggedSum(constructors)`
  Creates a constructor for each key in `constructors`. Returns a
  function with each constructor as a property. Allows
  `instanceof` checks for each constructor and the returned
  function.
  ```javascript
  const Option = daggy.taggedSum({
      Some: ['x'],
      None: []
  });
  Option.Some(1) instanceof Option.Some; // true
  Option.Some(1) instanceof Option; // true
  Option.None instanceof Option; // true
  function incOrZero(o) {
      return o.cata({
          Some: function(x) {
              return x + 1;
          },
          None: function() {
              return 0;
          }
      });
  }
  incOrZero(Option.Some(1)); // 2
  incOrZero(Option.None); // 0
  ```
**/
function taggedSum(constructors) {
    var key,
        ctor;

    function definitions() {
        throw new TypeError('Tagged sum was called instead of one of its properties.');
    }

    function makeCata(key) {
        // Note: we need the prototype from this function.
        return function(dispatches) {
            var i;

            const fields = constructors[key];
            const args = [];

            if(!dispatches[key])
                throw new TypeError("Constructors given to cata didn't include: " + key);

            for(i = 0; i < fields.length; i++)
                args.push(this[fields[i]]);

            return dispatches[key].apply(this, args);
        };
    }

    function makeProto(key) {
        const proto = Object.create(definitions.prototype);
        proto.cata = makeCata(key);
        return proto;
    }

    for(key in constructors) {
        if(!constructors[key].length) {
            definitions[key] = makeProto(key);
            definitions[key].toString = constant('()');
            continue;
        }
        ctor = tagged.apply(null, constructors[key]);
        definitions[key] = ctor;
        definitions[key].prototype = makeProto(key);
        definitions[key].prototype.constructor = ctor;
    }

    return definitions;
}
module.exports = {tagged, taggedSum};
},{}],25:[function(require,module,exports){
const { compose, traverse, curry, map, K, I, W}  = require('../../src/other-types/pointfree.js');
const Identity  = require('../../src/other-types/Identity.js');
const Const  = require('../../src/other-types/Const.js');

/* Cloning and splicing */
    //not really good enough for true Immutability, but good enough to play around with without imports/requires/tons of code
    const cloneShallow = obj => Object.assign({}, obj);
    const _splice = (index, replacement, xs) => xs.splice(index, 1, replacement) && xs;
    const _arraySplice = (index, replacement, xs) => _splice(index, replacement, xs.slice(0));
    const _objectSplice = (key, replacement, obj) => Object.defineProperty(cloneShallow(obj), key, {value:replacement, enumerable:true});

/* Lens Functions */
    const makeLens = curry(
      (getter, setter, key, f, xs) => 
        map(replacement => setter(key, replacement, xs), f(getter(key, xs))) 
    );

    const arrayLens = curry( (key, f, xs) => map(replacement => _arraySplice(key, replacement, xs), f(xs[key])) );
    const objectLens = curry( (key, f, xs) => map(replacement => _objectSplice(key, replacement, xs), f(xs[key])) );

/*Lens generators*/

    const lensPath = (...paths) => compose(...paths.map( path => 
      typeof path ==="string" && Number(path)!=path ? //make sure it's not just a #
        objectLens(path) : 
        arrayLens(path) 
      )
    );
    const lensGet = str => lensPath(...str.split('.'));


/* Lens methods */
    const view = curry( (lens, target) => lens(Const)(target).extract() );
    const over = curry( (lens, fn, target) => lens(y => Identity(fn(y)) )(target).extract() );
    const set = curry( (lens, val, target) => over(lens, K(val), target) );

/* Lens helpers */
    const mapped = curry( 
        (f, x) => Identity( 
            map( compose( x=>x.extract(), f), x) 
        ) 
    );

    //wrong, at least as I've implemented it, works exactly like map, yet doesn't work for Array!
    const traversed = function(f) {
      return traverse(f, this.of)
    }

    const makeLenses = (...paths) => paths.reduce( 
      (acc, key) => W(objectLens(key))(set)(acc),// set(objectLens(key), objectLens(key), acc)//at lens location, set the lens!
      { num : arrayLens, mapped, traversed }
    );

    //const _all = where => n => xs => makeLens(xs[], x=>x===)


module.exports ={
    makeLens,
    makeLenses,
    lensPath,
    lensGet,
    arrayLens,
    objectLens,
    view,
    over,
    set
};


    //const jsonIso = dimap(JSON.parse, JSON.stringify);//not an actual iso, as JSON.parse can fail

    //jsonIso( set(lensPath('hi'), 5) )('{"hi":6}');//-> "{hi:5}"






},{"../../src/other-types/Const.js":8,"../../src/other-types/Identity.js":14,"../../src/other-types/pointfree.js":29}],26:[function(require,module,exports){
const {Either, Right, Left}  = require('../../src/other-types/Either.js');
const {compose, I, lift}  = require('../../src/other-types/pointfree.js');

const takeLarger = x => y => x > y ? x : y;
const takeSmaller = x => y => x < y ? x : y;

//for 2 already sorted lists
const mergeSort = (xs, ys) => {
  if(!xs.length){
    return ys;
  }
  else if(!ys.length){
    return xs
  }
  else if (head(xs)<head(ys)){
    return [head(xs)].concat( mergeSort(tail(xs), ys) )
  }
  else{
    return [head(ys)].concat( mergeSort(xs, tail(ys)) )
  }
}


//now we're trying to work this out in terms of Either
const mergeSort2 = (xs, ys) => {
  return smallerHead(xs,ys)
}


//smallerHead :: Array -> Array -> a
const smallerHead = (xs, ys) => {
  return Either.safeHead(xs)
    .orElse(Infinity)
    .map(takeSmaller)
    .ap(
      Either.safeHead(ys).orElse(Infinity)
    )
}

//trying 
//......
const takeSmallerRec = xs => ys => x => y => x < y ? 
  [x].concat(takeSmallerRec(tail(xs),ys)) : 
  [y].concat(takeSmallerRec(xs, tail(ys)));

//smallerHead :: Array -> Array -> a
const smallerHeadSort = (xs, ys) => {
  return Either.safeHead(xs)
    //.orElse(Infinity)
    .map(takeSmallerRec(xs,ys))
    .ap(
      Either.safeHead(ys)//.orElse(Infinity)
    )
    .fold(_=>[],I)//nope
}



module.exports = {
  mergeSort,
  takeLarger,
  takeSmaller,
  smallerHead
}
//mergeSort([1,5,89,100],[2,3,4,5,8,90])
},{"../../src/other-types/Either.js":11,"../../src/other-types/pointfree.js":29}],27:[function(require,module,exports){
//...and semigroups...
//concatenation is composition with one type (closed composition)
const {Left, Right}  = require('../../src/other-types/Either.js');
const {foldMap, compose}  = require('../../src/other-types/pointfree.js');

String.prototype.empty = x => '';//makes string a well behaved monoid for left to right cases
String.empty = String.prototype.empty;
//String.zero = String.prototype.zero = ;//there isn't one!

const Endo = function(runEndo){
  if (!(this instanceof Endo)) {
    return new Endo(runEndo);
  }
  this.appEndo = runEndo;
}

Endo.of = x => Endo(x);
Endo.empty = Endo.prototype.empty = _ => Endo(x=>x);
//Endo.zero = Endo.prototype.zero = _ => Endo(x=>Endo);//also can't think of one

//concat is just composition
Endo.prototype.concat = function(y) {
  return Endo(compose(this.appEndo,y.appEndo));
};
Endo.prototype.getResult = function() { return this.appEndo(); }

//concat is just composition
Endo.prototype.concat = function(y) {
  return Endo(compose(this.appEndo,y.appEndo));
};
Endo.prototype.fold = function(f) {
  return f(this.appEndo);
};

//composing together semigroup creating functions 
const Fn = function(f){
  if (!(this instanceof Fn)) {
    return new Fn(f);
  }
  this.f = f;//f is a fn that takes some value and returns some semigroup
}
Fn.prototype.fold = function(x){
  return this.f(x);
}
//o must be a Fn(f) where f is a function that returns the same semi-group
Fn.prototype.concat = function(o){
  return Fn(x=>this.f(x).concat(o.fold(x)));//extends the Fns to apply an eventual arg to both
}
Fn.empty = Fn.prototype.empty = _ => Fn(x=>x);
/*

Fn(x=>IO(_=>console.log(x+1))).concat(Fn(x=>IO(_=>console.log(x+9)))).fold(6).runIO()


//semigroups can be used to define a filter predicate from composed parts
const Fn = f => ({
  fold: f,
  concat: o => Fn(x=>f(x).concat(o.fold(x)))
});

const hasVowels = x => !!x.match(/[aeiou]/ig);
const longWord = x => x.length >= 5;

const longVowels = Fn(compose(All, hasVowels)).concat(Fn(compose(All, longWord)));

['gym','wdwdwdwdwdwd','adgesdfasf'].filter(x=>longVowels.fold(x).x);//->['adgesdfasf']
*/

/*
thinking through it...

addOne = x=> x+1
addTwo = x=> x+2
addThree = x => x+3

compose(addOne, addTwo) -> 
  (...args) => addOne(compose(addTwo)(...args)) -> 
  (...args) => addOne(addTwo(...args))

compose(addOne, addTwo, addThree) -> 
  (...args) => addOne(compose(addTwo, addThree)(...args)) -> 
  (...args) => addOne( ((...args2) => addTwo(compose(addThree)(...args2)))  (...args)) -> 
  (...args) => addOne( ((...args2) => addTwo(addThree(...args2)))  (...args))
*/


//Disjunction, the sticky-true Monoid (i.e. "any true" = true)
const Disjunction = function(x){
  if (!(this instanceof Disjunction)) {
    return new Disjunction(x);
  }
  this.x = x;
}

Disjunction.of = x => Disjunction(x);
Disjunction.empty = Disjunction.prototype.empty = () => Disjunction(false);
Disjunction.zero = Disjunction.prototype.zero = () => Disjunction(true);

Disjunction.prototype.equals = function(y) {
    return this.x === y.x;
};
Disjunction.prototype.concat = function(y) {
    return Disjunction(this.x || y.x);
};
Disjunction.prototype.fold = function(f) {
    return f(this.x);
};

//a Disjunction of true, once concatted to any other Disjunction, can never be turned false
//Disjunction.of(false).concat(Disjunction.of(true)).concat(Disjunction.of(false));

const Any = Disjunction;


//Conjunction, the sticky-false Monoid (i.e. all must be true)
const Conjunction = function(x){
  if (!(this instanceof Conjunction)) {
    return new Conjunction(x);
  }
  this.x = x;
}

Conjunction.of = x => Conjunction(x);
Conjunction.empty = Conjunction.prototype.empty = () => Conjunction(true);
Conjunction.zero = Conjunction.prototype.zero = () => Conjunction(false);

Conjunction.prototype.equals = function(y) {
    return this.x === y.x;
};
Conjunction.prototype.concat = function(y) {
    return Conjunction(this.x && y.x);
};
Conjunction.prototype.fold = function(f) {
    return f(this.x);
};

//a Conjunction of false, once concatted to any other Conjunction, can never be turned true
//Conjunction.of(false).concat(Conjunction.of(true)).concat(Conjunction.of(false));

const All = Conjunction;


//Sum, 
const Sum = function(x){
  if (!(this instanceof Sum)) {
    return new Sum(x);
  }
  this.x = x;
}

Sum.of = x => Sum(x);
Sum.empty = Sum.prototype.empty = () => Sum(0);
Sum.zero = Sum.prototype.zero = () => Sum(Infinity);

Sum.prototype.concat = function(y) {
    return Sum(this.x + y.x);
};
Sum.prototype.fold = function(f) {
    return f(this.x);
};


// Sum = x => ({
//   x,
//   concat: ({x:y}) => Sum(x+y)
// })
//List.of(1,2,4).foldMap(Sum, Sum.empty())

const Product = function(x){
  if (!(this instanceof Product)) {
    return new Product(x);
  }
  this.x = x;
}

Product.of = x => Product(x);
Product.empty = Product.prototype.empty = () => Product(1);
Product.zero = Product.prototype.zero = () => Product(0);

Product.prototype.concat = function(y) {
    return Product(this.x * y.x);
};
Product.prototype.fold = function(f) {
    return f(this.x);
};

/*
const First = function(x){
  if (!(this instanceof First)) {
    return new First(x);
  }
  this.x = x;
}

First.of = x => First(x);

First.prototype.concat = function(y) {
    return this;
};
//but this has no possible "empty" interface
*/

//there IS a possible way to make any semigroup work as a monoid, though, sort of by elevating it up a level
const First = function(either){
  if (!(this instanceof First)) {
    return new First(either);
  }
  this.either = either;
}
First.prototype.fold = function(f){
  return f(this.either);
};
First.of = x => First(Right(x));

//not correct, but sort of on that track 
First.prototype.concat = function(o) {
  return this.either.cata({
    Right: x => First(this.either),
    Left: _ => o
  });
};
//and now we can define this
First.empty = _ => First(Left());

//static method
First.foldMap = (xs, f) => foldMap(First, x=> First(f(x)? Right(x): Left()), xs).fold(I);
/*

//some use cases for First

const find = (xs, f) => foldMap(First, x=> First(f(x)? Right(x): Left()), xs).fold(I);
find([3,4,5,6,7], x=> x>4);// -> finds just the first one, if any
*/



const Last = function(either){
  if (!(this instanceof Last)) {
    return new Last(either);
  }
  this.either = either;
}
Last.prototype.fold = function(f){
  return f(this.either)
};
Last.of = x => Last(Right(x));

//not correct, but sort of on that track 
Last.prototype.concat = function(o) {
  return this.either.cata({
    Right: x => o,
    Left: _ => o
  });
};
//and now we can define this
Last.empty = _ => Last(Left());


Last.foldMap = (xs, f) => foldMap(Last, x=> Last(f(x)? Right(x): Left()), xs).fold(I);



const Max = function(x){
  if (!(this instanceof Max)) {
    return new Max(x);
  }
  this.x = x;
}

Max.of = x => Max(x);
Max.empty = Max.prototype.empty = () => Max(0);
Max.zero = Max.prototype.zero = () => Max(Infinity);

Max.prototype.equals = function(y) {
    return Max(this.x === y.x);
};

Max.prototype.concat = function(y) {
    return Max(this.x > y.x ? this.x : y.x);
};


const Min = function(x){
  if (!(this instanceof Min)) {
    return new Min(x);
  }
  this.x = x;
}

Min.of = x => Min(x);
Min.empty = Min.prototype.empty = () => Min(Infinity);
Min.zero = Min.prototype.zero = () => Min(-Infinity);

Min.prototype.equals = function(y) {
    return Min(this.x === y.x);
};

Min.prototype.concat = function(y) {
    return Min(this.x < y.x ? this.x : y.x);
};


//Max 
//Min, etc. all really require some further constraints, like Ord?

/*
const rec1 =  Map({
  username: First('drew'),
  money: Sum(10),
  lastLogin: Max(34223334523) 
});

const rec2 = Map({
  username: First('drew'),
  money: Sum(10),
  lastLogin: Max(34234523) 
})

now we can teach entire objects how to combine because all their values are captured in types that know how they work

*/
const getResult = M => M.getResult ? M.getResult() : M.fold(I);

module.exports = {
  Sum,
  Product,
  Additive: Sum,
  Disjunction: Any,
  Any,
  All,
  Endo,
  getResult,
  Max,
  Min,
  First,
  Last,
  First,
  Last,
  Fn
}
},{"../../src/other-types/Either.js":11,"../../src/other-types/pointfree.js":29}],28:[function(require,module,exports){
const Task  = require('../../src/other-types/Task.js');

//natural transformation
const idToTask = i => i.fold(Task.of);
const maybeToTaskWMsg = msg => m => m.reduce((acc,x)=>Task.of(x), Task.rejected(msg));
const maybeToTask = maybeToTaskWMsg(null);
const maybeToIO = m => m.reduce((acc,x)=>IO.of(x), IO.of(undefined));
const maybeToEither = m => m.reduce((acc,x)=>Either.of(x), Left(null));
const eitherToTask = e => e.fold(Task.rejected, Task.of);
const ioToTask = i => new Task((rej, res) => res(i.runIO()));
const readerToTask = r => new Task((rej,res)=>res(r.run()));
//const eitherToIO = e => e.fold(x=>IO.of(undefined),x=>IO.of(x))
const idToArray = id => [id.fold(I)];

//safeHead/Maybe.head IS a natural transformation! Array -> Maybe
//so is Map({hi:true}).toArray()
//reverse?
const maybeToArray = m => m.cata({Just:x=>[x],Nothing:_=>[]});// or, m.reduce((acc,x)=>acc.concat(x),[]);
const readerToMaybe = r => fromNullable(r.run());//I don't think so... https://bartoszmilewski.com/2015/04/07/natural-transformations/

/*
[[1,5,6],['a','b','c']].chain(Maybe.head).sequence(Maybe.of)
t1(t2).chain(nt t2->t3).sequence(t3.of)

.chain(f).sequence(of) = ???

other examples of this pattern?

Just(Just(9)).map(maybeToEither).sequence()




Task.of('#email')
  .map(IO.$)
  .chain(ioToTask)
  .map(Maybe.head)
  .chain(maybeToTask)
  .map(IO.setAttr('value','dtipsonsyasdasdasd@gmail.com'))
  .chain(ioToTask)
  .fork(e=>console.log(e), I);



*/

/*
Db.find Task of an Either(user|null)
//ways of dealing with nested types: MonadTransformers/natural transformations

Db.find => Task(Either)


Db.find(1)
  .chain(eitherToTask)//-> now everything is a task, though either branch is lost
  .chain(u=>Db.find(u.best_friend_id))
  .chain(eitherToTask)
  .fork(error => send(500,{error}), u=>send(200,u));

//with natural transformation, we lose one of the error paths: it's collapsed

//natural transformation: order of this shouldn't matter
(map(f), nt) == (nt, map(f))

//alternative, using traverse to keep types, and both branches

Db.find(1)
  .chain(eu=>
    eu.traverse(Task.of, u=>Db.find(u.best_friend_id))
  )
  .chain(eeu=>eeu.chain(x=>x))
  .fork(e=>send(500,{e}), eu => eu.fold(e=>404,I));



  Map({
    cu:getUser(4),
    timeline: getTime(4)
  })
    .traverse(Task.of, I)
    .fork(e=>console.error(e),x=>console.log(x))

*/

module.exports = {
  idToTask,
  eitherToTask,
  ioToTask,
  readerToTask,
  idToArray,
  maybeToArray,
  readerToMaybe,
  maybeToTask,
  maybeToTaskWMsg,
  maybeToEither,
  maybeToIO
}
},{"../../src/other-types/Task.js":20}],29:[function(require,module,exports){
const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));

const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const I = x => x;//identity
const K = curry((x,y) => x);//constant
const W = curry((x,f) => f(x)(x));//duplication
const S = curry((f, g, x) => f(x)(g(x)));//substitution
const S2 = f => g => x => f(x, g(x));//substitution, but for non-curried

const binaryLeft = curry((x, l, _) => l(x));
const binaryRight = curry((x, _, r) => r(x));


//String -> Object -> Arguments -> ?
const invoke = curry(
  (methodname, obj) => (...args) => obj[methodname](...args)
);
const andCall = curry(
  (methodname, obj) => obj[methodname](...args)
);

//these assume that Function/Promise/Array have .ap/.chain/etc. defined, but those could be polyfilled
const ap = curry((A, A2) => A.ap(A2));
const map = curry((f, F) => F.map(x=>f(x)));//guard against Array.map
const reduce = curry((f, acc, Foldable) => Foldable.reduce(f,acc));
const chain = curry((f, M) => M.chain(f));
  //function version
  // if (typeof monad === 'function') {
  //   return function(x) { return fn(monad(x))(x); };
  // }

const lift = map;
const liftA2 = curry((f, A1, A2) => A1.map(f).ap(A2));//
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));
//look ma, no map needed!
//const liftA22 = curry((f, A1, A2) => A1.constructor.of(f).ap(A1).ap(A2));

const dimap = curry( (lmap, rmap, fn) => compose(rmap, fn, lmap) );
//mutates just the ouput of a function to be named later
const lmap = contramap = f => dimap(f, I);
//mutates the input of a function to be named later    
const rmap = dimap(x=>x);

const iso = dimap;

iso.mapISO = iso(x=>[...x], xs=>new Map(xs));

const Iso = (to,from) => ({to,from});

const singleton = Iso(e=>e.fold(_=>[],x=>[x]),([x])=>x?Right(x):Left(undefined))
const filterEither = (e,pred) => singleton.from(singleton.to(e).filter(pred))

//based off of https://github.com/DrBoolean/immutable-ext
Map.prototype.concat = function(otherMap){
  const newMap = [];
  for (let [key, value] of this) {
    let otherValue = otherMap.get(key); 
    if(!value.concat || !otherValue.concat){
      throw new Error('values must be semigroups');
    }
    newMap.push([key,value.concat(otherValue)])
  }
  return new Map(newMap);
}

Map.prototype.annotate = function(typeMap){
  const newMap = [];
  for (let [key, value] of this) {
    let typeConstructor = typeMap.get(key); 
    newMap.push([key,typeConstructor(value)])
  }
  return new Map(newMap);
}

Map.prototype.concatTypes = function(otherMap, typeMap){
  const newMap = [];
  for (let [key, value] of this) {
    const typeConstructor = typeMap.get(key); 
    const otherValue = typeConstructor(otherMap.get(key)); 
    newMap.push([key,typeConstructor(value).concat(otherValue)])
  }
  return new Map(newMap);
}




const head = xs => xs.head || xs[0];
const init = xs => xs.slice(0,-1);
const tail = xs => xs.tail || xs.slice(1, Infinity);
const last = xs => xs.last ? xs.last() : xs.slice(-1)[0];
const prop = namespace => obj => obj[namespace];
const append = x => xs => xs.concat(x);

//these two include polyfills for arrays
const extend = fn => W => {
  return typeof W.extend ==="function" ?
    W.extend(fn) :
    W.map((_,i,arr)=>fn(arr.slice(i)))
};
const extract = W => {
  return typeof W.extract ==="function" ? 
    W.extract() :
    head(W);
};

const concat = curry( (xs, x) => xs.concat(x));
//inferring empty is not a great idea here...
//m here stands for monoid, not monad
const mconcat = (xs, empty) => xs.length||xs.size() ? xs.reduce(concat, empty) : empty ? empty() : xs.empty();
const bimap = curry((f,g,B)=> B.bimap(f,g)); 

// const foldMap = curry(function(f, fldable) {
//   return fldable.reduce(function(acc, x) {
//     const r = f(x);
//     acc = acc || r.empty();
//     return acc.concat(r);
//   }, null);
// });

//const fold = foldMap(I);


//have to specify the monoid upfront here
// foldMap : (Monoid m, Foldable f) => m -> (a -> m) -> f a -> m
const foldMap = curry(
  (Monoid, f, Foldable) => Foldable.reduce((acc, x) => acc.concat(f(x)), Monoid.empty())
);

const foldAs = curry(
  (Monoid, Foldable) => foldMap(Monoid, Monoid, Foldable).x
); 

var fold3 = curry(
  (lfn, rfn, foldable) => foldable.fold(lfn,rfn)
);

// fold : (Monoid m, Foldable f) => m -> f m -> m
const fold = curry(
  (Monoid, Foldable) => foldMap(Monoid, I, Foldable)
);

//if the fn produces Monoids from the values inside foldables with an .empty instance on constructor and instances then all we need is the fn and the foldable...
var foldMap2 = curry(function(f, fldable) {
  return fldable.reduce(function(acc, x) {
    var r = f(x);
    acc = acc || r.empty();
    return acc.concat(r);
  }, null);
});

// fold : (Binary Reducing fn, Target Type g, foldable)
var fold2 = curry(
  (rfn, g, fldable) => fldable.fold(rfn, g)
);



//from http://robotlolita.me/2013/12/08/a-monad-in-practicality-first-class-failures.html
function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}

//Kleisli composition
const kleisli_comp = (f, g) => x => f(x).chain(g)
const composeK = (...fns) => compose( ...([I].concat(map(chain, fns))) );

  //specialized reducer, but why is it internalized?
  const perform = point => (mr, mx) => mr.chain(xs => mx.chain( x => { 
      xs.push(x); 
      return point(xs);
    })
  );

//array.sequence, alternate
const sequence = curry((point, ms) => {
  return typeof ms.sequence === 'function' ?
    ms.sequence(point) :
    ms.reduce(perform(point), point([]));
});

const traverse = curry( (f, point, Traversable) => Traversable.map(f).sequence(point) );

const runIO = IO => IO.runIO();

//reducing patterns

const any = (acc, x) => x || acc;//empty is false
const all = (acc, x) => x && acc;//empty is true

const converge = curry((f, g, h) => (...args) => f(g(...args), h(...args)));

const apply  = f => arr => f(...arr)
const unapply = f => (...args) => f(args);

module.exports = {
  I,
  K,
  S,
  W,
  append,
  apply,
  unapply,
  compose,
  composeK,
  kleisli_comp,
  converge,
  curry,
  curryN,
  reduce,
  ap,
  map,
  chain,
  mconcat,
  concat,
  liftA2,
  liftA3,
  sequence,
  traverse,
  invoke,
  head,
  tail,
  init,
  last,
  prop,
  extend,
  extract,
  bimap,
  fold,
  foldAs,
  foldMap,
  lmap,
  rmap,
  iso,
  Iso,
  dimap,
  any,
  all,
  runIO,
  binaryLeft,
  binaryRight
};
},{}],30:[function(require,module,exports){
(function (global){
const {curry}  = require('../../src/other-types/pointfree.js');
const IO = require('../../src/other-types/IO.js');

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

  //utility function for setting and getting cookies
  function gup(name) {
      name = name.replace(/(\[|\])/g,"\\$1");
      var regex = new RegExp("[\\?&]"+name+"=([^&#]*)"),
          results = regex.exec( window.location.href );
      return ( results === null )?"":results[1];
  }
  //get cookies
  function c(k){return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2];}

  function setcookie(n,v,ex) { 
    document.cookie = n+"="+v+"; Path=/; domain="+window.location.hostname+"; "+((ex)?"expires="+new Date(Date.now()+(ex*864e5)).toGMTString():'');
    return v;
  }

  const [gupIO, cIO, setcookieIO] = [gup,c,setcookie].map(IO.lift);



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
  booleanEquals,
  gupIO, cIO, setcookieIO
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../src/other-types/IO.js":13,"../../src/other-types/pointfree.js":29}]},{},[1]);
