const {curry, compose, head, init, last, tail, prop}  = require('../src/other-types/pointfree.js');

function Maybe(){//create a prototype for Nothing/Just to inherit from
    throw new TypeError('Maybe is not called directly');
}

//We only ever need one "Nothing" so we'll define the type, create the one instance, and return it. We could have just created an object with 
//all these methods on it, but then it wouldn't log as nicely/clearly
const Nothing = (function(){
  const Nothing = function(){};
  Nothing.prototype = Object.create(Maybe.prototype);
  Nothing.prototype.ap = Nothing.prototype.chain = Nothing.prototype.join = Nothing.prototype.flatten = Nothing.prototype.map = Nothing.prototype.filter = Nothing.prototype.empty = function(){ return this; };
  Nothing.prototype.sequence = function(of){ return of(this); };//flips Nothing insde a type, i.e.: Type[Nothing]
  Nothing.prototype.traverse = function(fn, of){ return of(this); };//same as above, just ignores the map fn
  Nothing.prototype.reduce = Nothing.prototype.fold = (f, x) => x,//binary function is ignored, the accumulator returned
  Nothing.prototype.getOrElse = Nothing.prototype.orElse = Nothing.prototype.concat = x => x;//just returns the provided value
  Nothing.prototype.cata = ({Nothing}) => Nothing();  //not the Nothing type constructor here, btw, a prop named "Nothing" defining a nullary function!
  Nothing.prototype.equals = function(y){return y==this;};//setoid
  Nothing.prototype.toString = _ => 'Nothing';
  Nothing.prototype.toBoolean = _ => false;//reduce a Nothing to false
  //Nothing.prototype[Symbol.toPrimitive] = function(hint){ return hint=='string' ? "" : 0; };//define some behavior for coercion: empty string for string coercion, 0 for number coercion
  Nothing.prototype.toJSON = _ => '{"type":"Maybe.Nothing"}';

  return new Nothing();
})();//result will fail an instanceof Nothing check, because "Nothing" is not the Nothing constructor in the outer scope

//now we'll create a Just type with all the same interfaces we defined on Nothing

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
Just.prototype.traverse = function(fn, of){ return this.map(fn).sequence(of); };//transform the inner value (resulting in an inner type) then flip that type outside
Just.prototype.toString = function(){ return `Just[${this.value}]`; };
Just.prototype.reduce = function(f, x) { return f(x, this.value); };//standard binary function, value in Just is the only item
Just.prototype.empty = _ => Nothing;
Just.prototype.filter = function(fn){ return this.chain(x=> fn(x)? this : Nothing ); };//test the inner value with a function

//assuming that the inner value has a concat method, concat it with another Just. Falls back to + for strings and numbers
Just.prototype.concat = function(b){
  return b.value && !Maybe.isNull(b.value) ? Just(this.value.concat ? this.value.concat(b.value) : this.value + b.value) : this 
};
Just.prototype.equals = function(y){ return y.value === this.value; };//strictly compare the inner values
//Just.prototype[Symbol.toPrimitive] = Just.prototype.getOrElse = function(){ return this.value; };//extract the inner value when forcibly coerced to deliver a value
Just.prototype.orElse = function(){ return this; }//does nothing in the Just case
Just.prototype.cata = function({Just}){ return Just(this.value) };//calls the function defined in prop "Just" with the inner value
Just.prototype.toBoolean = _ => true;//reduce a Just to true. Useful in filters
Just.prototype.toJSON = function(){ return `{"type":"Maybe.Just","value":${JSON.stringify(this.value)}}`; };

const isNull = x => x===null || x===undefined;
const fromNullable =  x => isNull(x) ? Nothing : Just(x);

//we're not strictly defining Just and Nothing as subtypes of Maybe here, but we DO want to have a Maybe interface for more abstract usages
Object.assign(Maybe, {
  of: x => new Just(x),//pointed interface to create the type (Just(9)/Maybe.of are synonymous )
  empty: Nothing.empty,//calling empty returns a Nothing
  toBoolean: m => m!==Nothing,//reduce a passed in Just[any value]/Nothing value to true or false, useful for filters
  isNull,
  fromNullable,
  fromFilter: fn => x => fn(x) ? Just(x) : Nothing,
  maybe: curry((nothingVal, justFn, M) => M.reduce( (_,x) => justFn(x), nothingVal )),//no accumulator usage
  head: compose(fromNullable, head),
  tail: compose(fromNullable, tail),
  init: compose(fromNullable, init),
  last: compose(fromNullable, last),
  prop: namespace => compose(fromNullable, prop(namespace))
});

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