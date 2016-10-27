const {invoke}  = require('../../src/other-types/pointfree.js');


function Reader(run) {
  if (!(this instanceof Reader)) {
    return new Reader(run);
  }
  this.run = run;
}

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

//no, and probably not actually possible or desirable: Reader wants to be externalized
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
Reader.execer = R => R.chain(x => Reader.ask.map(fn => fn(x)));//for single functions, baking in chain
Reader.invoke = methodname => x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x));//for interfaces w/ named methods
Reader.invoker = methodname => R => R.chain(x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x)));//for interfaces w/ named methods, baking in the chain
Reader.run = R => R.run;//can be used inline in a composition to expose the run function as the callable interface

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