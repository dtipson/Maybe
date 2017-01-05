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