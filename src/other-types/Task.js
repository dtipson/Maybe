/*as we've done in the past, we'll start by creating a sort of type container constructor, using a little trick from daggy to allow us to create Typed values without being forced to rely on the new keyword: */

// fn => Task fn
const Task = function(computation){
  if (!(this instanceof Task)) {
    return new Task(computation);
  }
  this.fork = computation;
};


/*

one thing to notice immediately here is that the constructor we're creating is IDENTICAL to both the IO and Reader types: it takes a single argument and then creates a type that stores a function.

What sort of function is it?  Well, we haven't said yet!  In fact, we haven't _actually_ even said that it's a function yet!  Because at this point, the constructor could just as easily hold a value and be the start of an Identity type! We happened to have given the "value" a descriptive name, but that's only to avoid confusion when we later on define particular methods that use it in a particular way.

For now though, this is just the power of abstraction at work again: a Type is a container of "something."  Some Types hold two things (no pun intended).  Some hold no things. Some types hold one sort of thing OR another sort of thing (those will require a different sort of boilerplate). These are broad strokes.

So let's get more specific: let's define a way to get a simple value into the type.  Here's where we'll start to see the shape of the sort of thing we're building up.
*/

//we'll define it as a static method and stick it on the prototype as well for convienience
Task.of = Task.prototype.of = x => new Task((a, b) => b(x));
/*
Now .of is an interface that allows us to get a primitive value "up" into the type. We already said that the type is going to hold a function, so how does a type that holds a function represent a primitive value? Well, by creating a function that, when called, returns a value of course!  This should seem familiar if you've looked into the IO type: the definition of IO.of was basically just a generic way to create a function that, when later called, would return a value.

x => IO(_=>x)

Our simple Task.of is very similar, with one very important difference: the function is in question is going to be binary. That means that it'll always be a function that takes two arguments. In fact, it's even trickier than that: both of those arguments are themselves functions! Let's not get too tripped up on that for now though: in the case of .of, one of those arguments is basically ignored, and the second one is immediately called with the original value. The result is exactly the same as IO: when the type is activated (whether by .runIO or .fork), it returns the original, simple value.  

Seems pretty convoluted, doesn't it!  But everytime you call Promise.resolve you're doing almost exactly this. If you mentally model Promise.resolve(5) as "creating a Promise of a five" then our Task.of(5) is exactly the same thing.

However, our Task type is actually a little more reserved: in fact, it's lazy.  Promise.resolve(5) actually generates a Promise with a 5 in it right away: it becomes a sort of stateful container that (then immediately) contains an actual 5.  But Task.of(5) doesn't actually do anything: it's a purely conceptual 5, yet unrealized.  To use a common metaphor: Promises contain explosions, but something like a Task is a grenade with the pin still in.  And to pull the pin, you need to call its fork method.  

Task.of(5).fork(_,x=>x) -> 5

Wait... what's that, it synchronously returned a value?!  Well, yes.  Remember: fork is just a binary function, and its arguments were both just unary functions that would get called and return values according to whatever logic the type originally defined.  For Task.of, that logic was just to call the second function with a 5 AND return the result. It didn't _have_ to return the result of course (and we're about to see cases where it cannot), but that's what made sense.

Now if, when first taught yourself about Promises, you spent weeks training yourself out of the habit of thinking that an asynchronous type could ever return a synchronous value, this might be a little maddening.  But as it turns out "asynchronous" was probably always too specific.  What we're really modeling here are continuations: operations with dependencies that may or may not be blocked, waiting for some other operations to complete. 

Laziness is actually a lot easier to see if we compare Promises to Tasks using setTimeout.

const pFive = new Promise(function(resolve,reject){
  console.log('promise called');
  return setTimeout(_=>resolve(5), 3000);
});
const tFive = Task(function(reject, resolve){
  console.log('task called');
  return setTimeout(_=>resolve(5), 3000);
});

The Promise code is run immediately, triggering our log state.  The task code is not: it won't run until it's forked.  Another important thing to see here though is that with a Task, "the running" and "the type" are separate entities. Promises are both at once: both the contract promising an eventual value and the execution of the process that will realize it.  Our Task type is just a description of the contract and nothing more.  It's also not stateful: you can call tFive.fork as many times as you want, and each time it will execute the same operation.  Even though it'll coordinate activating the correct callback asynchronously if needed, it itself has no "state" that changes from "pending" to "resolved/rejected" over time (this is one reason native Promises are and will always be slower than functional alternatives).

But let's look even more carefully: the functions that define these types are, in the end, just simple functions, right?  But what are they returning in this setTimeout case?  They can't return a 5 any more, because the "5" isn't "available" synchronously. But they still return something, and in both cases, that something is the result of setTimeout: a unique id that you can use to cancel the operation! How useful!

But here we run into the next major difference between Promises and Task: in the case of a Promise, that id falls into a black hole.  What you return from the Promise constructor function is basically irrelevant.  I have no idea what happens to it, if anything. 

In the Task case though, the return value isn't lost at all: it is, in fact, the synchronous result of calling fork!  Which means that when we decide to execute our operation, we have a clean way to return any sort of value or api we need, including a means to cancel the original operation. Here's an example of how Task is easy to cancel, while Promise... well it's almost impossible without resorting to tricks like interweaving some outer variables right into the constructor.

const pFive = new Promise(function(resolve,reject){
  console.log('promise called');
  return setTimeout(_=>resolve(5), 3000);
});
const tFive = Task(function(reject, resolve){
  console.log('task called');
  const token = setTimeout(_=>resolve(5), 3000);
  return x => clearTimeout(token);
});

pFive.then(x=>console.log(`promise callback: ${x}`));
const cancel = tFive.fork(_=>_,x=>console.log(`task callback: ${x}`));
cancel();//logs task called, but cancelation means that the task callback is never called

You might have been reading a lot of controversy over fetch, cancelable Promises cancelTokens, etc.  It's a mess. At the moment, the spec basically entails exactly the approach I noted above: creating a special side-effecting token function ahead of time and then piping it into the Promise constructor (or Promise-returning api method, like fetch). 

https://github.com/tc39/proposal-cancelable-promises/blob/master/Cancel%20Tokens.md

Well, this mess exists precisely because the Promises/A+ solution inextricably mashes together the (pure) description of an operation with its actual (usually impure/side-effecting) execution, leaving no sensible place to return any separate control over the execution.  

A Promise of x means that x is already on it's way, and that the Promise itself is a stateful object representing an eventual future.  In this conceptual model, canceling the promise isn't just the matter of a tricky, awkward api (though it is tricky and awkward): it's conceptually a BAD thing!  It's like introducing time-travel to a formerly predictable timeline. Because potentially multiple side-effects can depend on the result of a single promise, cancelation can throw a series of predictable, loosely-linked outcomes into disarray: different parts of an application might consider a resource and its effects to be no longer relevant.

The value of Task is that it allows you separate compositional logic from side-effects entirely.  There is no potential for time travel until time is allowed to run in the first place (which is precisely why Task's method is called "fork").

Let's add some pure functionality to Task to see what that means

*/

Task.prototype.map = function map(f) {
  return new Task(
    (left, right) => this.fork(
      a => left(a),
      b => right(f(b))
    )
  );
};

/*
Task wouldn't be a lot of fun it it wasn't a functor or a monad

Adding a standard interface for cancelation (i.e. fork returns a function that cancels the effect) isn't going to make things pretty, but it is pretty straightfoward

*/
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
  );
};

/*
With these standard methods in place, we now have a way to describe operations over potentially "future" values.

"Error" Handling

We've held off discussing a pretty big element of Task: the fact that it can represent a particular expected value OR something else.  Note that we didn't really say "error."  We'll get to that in a second.  With Promises, handling errors works like this:

.then(sideEffectingFn, errorHandlingFn) or, if they're a little more careful 
.then(sideEffectingFn).catch(errorHandlingFn)

Why do we have to be careful?  Because Promises absorb runtime errors.  That is, for every supposedly compositional operation you perform, if you've made a mistake in your code, then Promises will automatically catch the error and switch branches on you, turning a resolution into a rejection.  This property is often actually celebrated: Promises model "try/catch" for asynchronous code!  That might sound appealing, but it's worth asking why that is: do we normally wrap nearly every major line of synchronous code in a try/catch block? No: when we're writing our programs, if we mess up, we expect them to break.  It's only in very specific, carefully selected situations that it makes sense to use try/catch. Otherwise, we expect bugs to crash our programs, forcing us to fix them.  Promises don't give us a choice: we're opted into try/catch automatically.

Worse, because of the mess with cancelations, part of the proposed solution is not to fix Promises, but rather to complicate try/catch itself to introduce a 3rd state: a sort of "was canceled" state.

Tasks, on the other hand, simply don't include such logic in the first place: not hard-coded into the Type at least.  If you want to introduce try/catch logic in your Task constructor, you can, and you can even hook that into your Left|Right values if you wish.  And if you want to catch errors that happen as the result of side-effects in the fork handlers, you can (some popular FL libraries offer an option in their fork methods to catch errors).  But it's not mandatory. It may sound counter-inuitive, but most of the time we actually DON'T want to automatically catch errors.  Instead, we want to union types

*/

const fetchTask = (resource, config={}) => new Task(function(reject, resolve){
  fetch(resource, config).then(x=>resolve(x)).catch(e=>reject(e));//don't return anything, cancelTokens don't exist yet
});


// const fetchTask = (resource, config={}) => new Task(function(reject, resolve){
//   const cancelToken = const { token, cancel } = CancelToken.source();
//   fetch(resource, Object.assign(config, {cancelToken:token})).then(x=>resolve(x)).catch(e=>reject(e)); 
//   return cancel;
// });

Task.fetch = fetchTask;

module.exports = Task;