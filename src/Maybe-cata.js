//this is basically a reproduction of fantasy-options + daggy, a library for creating tagged and taggedSum constructors with functional instanceof checks

//Maybe here is represented as a tagged Sum type, which gives us a method "cata" that allows us to define particular matched sets of behavior for each of the inner types. The first one defined is fold, which has a strong relationship to cata itself.

function getInstance(self, constructor) {
    return self instanceof constructor ? self : Object.create(constructor.prototype);
}

const constant = x => _ => x;
const identity = x => x;

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

//creates the type, gives us the cata method to define behavior for each type
const Maybe = taggedSum({
  Just: ['x'],
  Nothing: []
});

//fold gives us an even more convienient interface than cata for disjunctive behavior without "checking"
Maybe.prototype.fold = Maybe.prototype.reduce = function(f, g) {
  return this.cata({
    Just: x => f(g, x),
    Nothing: g
  });
};
Maybe.of = Maybe.Just;
Maybe.empty = () => Maybe.Nothing;


//getters
Maybe.prototype.orElse = function(x) {
    return this.fold(
        Maybe.Just,
        constant(x)
    );
};
Maybe.prototype.getOrElse = function(x) {
    return this.fold(
        identity,
        constant(x)
    );
};
//monads
Maybe.prototype.chain = function(f) {
    return this.fold(
        a => f(a),
        constant(Maybe.Nothing)
    );
};
//semigroup/monoids (empty is already defined)
Maybe.prototype.concat = function(x) {
  return this.chain( a => {
    return x.map( b => a.concat(b));
  });
};
//functor
Maybe.prototype.map = function(f) {
  return this.chain( a => Maybe.of(f(a)) );
};
//applicative
Maybe.prototype.ap = function(a) {
  return this.chain( f => a.map(f) );
};
//traversable
Maybe.prototype.sequence = function(p) {
  return this.traverse(identity, p);
};
Maybe.prototype.traverse = function(f, p) {
  return this.cata({
    Just: x => f(x).map(Maybe.of),
    Nothing: () => p.of(Maybe.Nothing)
  });
};
//setoid
Maybe.prototype.equals = function(m) {
  return this.cata({
    Just: x => m===x,
    Nothing: () => m === Maybe.Nothing
  });
}

// Maybe.prototype.filter = ?


// const Maybe = {
//   of: x => new Just(x),
//   empty: _ => Nothing,
//   toBool: m => m!==Nothing,//reduce value/no value to true or false
//   isNull: x=> x===null || x===undefined,
//   fromNullable: x=> Maybe.isNull(x) ? Nothing : Just(x),
//   maybe: function(nothingVal, justFn, m) {
//     return m.reduce(function(_, x) {
//       return justFn(x);
//     }, nothingVal);
//   }
// };

// module.exports = {
//   Maybe,
//   Just,
//   Nothing
// };