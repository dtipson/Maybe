//...and semigroups...
//concatenation is composition with one type (closed composition)
const {Left, Right}  = require('../../src/other-types/Either.js');


String.prototype.empty = x => '';//makes string a well behaved monoid for left to right cases
String.empty = String.prototype.empty;

const Endo = function(runEndo){
  if (!(this instanceof Endo)) {
    return new Endo(runEndo);
  }
  this.appEndo = runEndo;
}

Endo.of = x => Endo(x);
Endo.empty = Endo.prototype.empty = _ => Endo(x=>x);

//concat is just composition
Endo.prototype.concat = function(y) {
  return Endo(compose(this.appEndo,y.appEndo));
};
Endo.prototype.getResult = function() { return this.appEndo; }

//concat is just composition
Endo.prototype.concat = function(y) {
  return Endo(compose(this.appEndo,y.appEndo));
};


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

Disjunction.prototype.equals = function(y) {
    return this.x === y.x;
};
Disjunction.prototype.concat = function(y) {
    return Disjunction(this.x || y.x);
};

//a Disjunction of true, once concatted to any other Disjunction, can never be turned false
//Disjunction.of(false).concat(Disjunction.of(true)).concat(Disjunction.of(false));

const Any = Disjunction;


//Conjunction, the sticky-false Monoid (i.e. all must be true or "any false")
const Conjunction = function(x){
  if (!(this instanceof Conjunction)) {
    return new Conjunction(x);
  }
  this.x = x;
}

Conjunction.of = x => Conjunction(x);
Conjunction.empty = Conjunction.prototype.empty = () => Conjunction(true);

Conjunction.prototype.equals = function(y) {
    return this.x === y.x;
};
Conjunction.prototype.concat = function(y) {
    return Conjunction(this.x && y.x);
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

Sum.prototype.concat = function(y) {
    return Sum(this.x + y.x);
};

// Sum = x => ({
//   x,
//   concat: ({x:y}) => Sum(x+y)
// })


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
//but this has no possible empty interface


//not anywhere near right, but a possible way to make any semigroup work as a monoid
const Firsty = function(x){
  if (!(this instanceof Firsty)) {
    return new Firsty(x);
  }
  this.x = Right(x);
}

Firsty.of = x => Firsty(x);

//not correct, but sort of on that track 
Firsty.prototype.concat = function(y) {
  return this.x.fold()
};
//and now we can define this
Firsty.empty = _ => Left(null);


//List.of(1,2,4).foldMap(Sum, Sum.empty())



const Last = function(x){
  if (!(this instanceof Last)) {
    return new Last(x);
  }
  this.x = x;
}

Last.of = x => Last(x);

Last.prototype.concat = function(y) {
    return y;
};





const Max = function(x){
  if (!(this instanceof Max)) {
    return new Max(x);
  }
  this.x = x;
}

Max.of = x => Max(x);
Max.empty = Max.prototype.empty = () => Max(0);

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

Min.prototype.equals = function(y) {
    return Min(this.x === y.x);
};

Min.prototype.concat = function(y) {
    return Min(this.x < y.x ? this.x : y.x);
};


//Max 
//Min, etc. all really require some further constraints, like Ord

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
const getResult = M => M.getResult ? M.getResult() : M.x;

module.exports = {
  Sum,
  Any,
  All,
  Endo,
  getResult,
  Max,
  Min,
  First,
  Last,
  Firsty
}