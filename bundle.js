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
const Writer = require('./src/other-types/Writer-array.js');

Object.assign(
  window,
  require('./src/other-types/daggy.js'),
  require('./src/Maybe.js'),
  require('./src/media-recorder/videobooth.js'),
  require('./src/other-types/Either.js'),
  require('./src/other-types/lenses.js'),
  {Compose, Const, Continuation, Cont:Continuation, Task, Coyoneda, Identity, IO, Reader, Tuple, State, Store, Writer},
  require('./src/other-types/pointfree.js'),
  require('./src/other-types/monoids.js'),
  require('./src/other-types/Tree.js'),
  require('./src/other-types/Validation.js'),
  require('./src/other-types/utility.js')
);
},{"./src/Maybe.js":2,"./src/media-recorder/videobooth.js":3,"./src/other-types/Array-helpers.js":4,"./src/other-types/Compose.js":5,"./src/other-types/Const.js":6,"./src/other-types/Continuation.js":7,"./src/other-types/Coyoneda.js":8,"./src/other-types/Either.js":9,"./src/other-types/Function-helpers.js":10,"./src/other-types/IO.js":11,"./src/other-types/Identity.js":12,"./src/other-types/Promise-helpers.js":13,"./src/other-types/Reader.js":14,"./src/other-types/State.js":15,"./src/other-types/Store.js":16,"./src/other-types/Task.js":17,"./src/other-types/Tree.js":18,"./src/other-types/Tuple.js":19,"./src/other-types/Validation.js":20,"./src/other-types/Writer-array.js":21,"./src/other-types/daggy.js":22,"./src/other-types/lenses.js":23,"./src/other-types/monoids.js":24,"./src/other-types/pointfree.js":25,"./src/other-types/utility.js":26}],2:[function(require,module,exports){
const {curry, compose, head, init, last, tail, prop} = require('../src/other-types/pointfree.js');

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
  Nothing.prototype.reduce = Nothing.prototype.fold = (f, x) => x,//binary function is ignored, the accumulator returned
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
const fromNullable =  x => isNull(x) ? Nothing : Just(x);//includes null/undefined
const fromFalsy =  x => !x ? Nothing : Just(x);//includes 0 and ""
//includes empty arrays
const fromEmpty =  x => !x || (Array.isArray(x) && !x.length) ? Nothing : Just(x);

//we're not strictly defining Just and Nothing as subtypes of Maybe here, but we DO want to have a Maybe interface for more abstract usages
Object.assign(Maybe, {
  of: x => new Just(x),//pointed interface to create the type (Just(9)/Maybe.of are synonymous )
  empty: Nothing.empty,//calling empty returns a Nothing
  toBoolean: m => m!==Nothing,//reduce a passed in Just[any value]/Nothing value to true or false, useful for filters
  isNull,
  fromNullable,
  fromFalsy,
  fromEmpty,
  lift: fn => x => Just(fn(x)),
  fromFilter: fn => x => fn(x) ? Just(x) : Nothing,
  maybe: curry((nothingVal, justFn, M) => M.reduce( (_,x) => justFn(x), nothingVal )),//no accumulator usage
  head: compose(fromNullable, head),//safehead
  last: compose(fromNullable, last),//safelast
  prop: namespace => compose(fromNullable, prop(namespace))//safeprop
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
},{"../src/other-types/pointfree.js":25}],3:[function(require,module,exports){
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

document.querySelectorAll('button')[0].addEventListener('click',function(){
  document.body.innerHTML = '';
  requestRecord().then(stream => {
    recordInfinite(3000)(stream);
  });
});

},{"../../src/Maybe.js":2}],4:[function(require,module,exports){
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
Array.prototype.sequence = function(point){
    return this.reduceRight(
      function(acc, x) {
        return acc
          .map(innerarray => othertype => [othertype].concat(innerarray) )//puts this function in the type
          .ap(x);//then applies the inner othertype value to it
      },
      point([])
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
    return this.map(f).sequence(point||f);//common enough that it'll be the same to allow that
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

},{}],5:[function(require,module,exports){
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
},{"../../src/other-types/pointfree.js":25}],6:[function(require,module,exports){
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

Const.prototype.ap = function(fa) {
    return this.concat(fa);
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
},{}],7:[function(require,module,exports){
//lots of similarities here to Task, which is a sort of this married to an Either
//fork and handler are very similar: computation doesn't run until fork is calleds

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
},{}],8:[function(require,module,exports){
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

},{"../../src/other-types/pointfree.js":25}],9:[function(require,module,exports){
const {curry, K, I}  = require('../../src/other-types/pointfree.js');

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

///???
Either.prototype.fold = Either.prototype.reduce = function(f, g) {
  return this.cata({
    Left: f,
    Right: g
  });
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
Either.fromNullable = x => !x == null ? Right(x) : Left();
Either.fromFilter = fn => x => fn(x) ? Right(x) : Left(x);
Either.of = x => new Right(x);
Either.either = curry((leftFn, rightFn, E) => {
  console.log()
  if(E instanceof Left){
    return leftFn(E.l);
  }
  else if(E instanceof Right){
    return rightFn(E.r);
  }else{
    throw new TypeError('invalid type given to Either.either');
  }
});


module.exports = {
  Either,
  Left,
  Right
};
},{"../../src/other-types/pointfree.js":25}],10:[function(require,module,exports){
//because functions need help too

const {S}  = require('../../src/other-types/pointfree.js');

    //Baby's First Reader
    Function.of = x => _ => x;
    Function.prototype.map = function(f) {
        return x => f(this(x));//composition
    }
    //const isTwo = a => a===2
    //const notTwo = isTwo.map(x=>!x)

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
},{"../../src/other-types/pointfree.js":25}],11:[function(require,module,exports){
/*
const IO = fn =>({
  runIO: fn,//run the effect
  map: f => IO( a => f(fn(a)) ),//transform the value
  chain: f => IO( _ => f(fn()).runIO() ),//transform value into another pure operation
  fork: _ => IO(x => new Promise(r => window.setTimeout(_ => r(fn(x)), 0) ))//fork the process!
});
IO.of = x => IO(_ => x);
IO.$ = selectors => IO(_=>Array.from(document.querySelectorAll(selectors)));

//IO(_=>document.baseURI).map(x=>x.replace(/\//g,' :P ')).chain(x=>IO(_=>document.body.innerHTML=x))

//const getMouseClickPos = IO(e=>e).map(e=>e.clientX ).chain(x=>IO(_=>document.body.innerHTML=x))
//x=>IO.of(x).map(e=>e.clientX ).chain().chain(x=>IO(_=>document.body.innerHTML=x)).runIO()

document.addEventListener('click', x=>IO.of(x).map(e=>e.clientX ).chain(x=>IO(_=>document.body.innerHTML=x)).runIO());
*/


function IO(fn) {
  if (!(this instanceof IO)) {
    return new IO(fn);
  }
  this.runIO = fn;//IO creates an extra control layer above a function
}

IO.of = IO.prototype.of = x => IO(_=>x);//basically the same as IO(K(x))

IO.prototype.chain = function(f) {
  return IO(_ => f(this.runIO()).runIO() );
};
//operations sequenced in next stack?
IO.prototype.fork = function(f) {
  return IO(_ => new Promise( r => window.setTimeout(()=>r(this.runIO()),0) ));
};

IO.prototype.ap = function(a) {
  return this.chain( f => a.map(f));
};

IO.prototype.map = function(f) {
  return this.chain( a => IO.of(f(a)) );
};

//?unproven/maybe not possible?
// IO.prototype.sequence = function(of) {
//   return of(IO.of).ap(of(this.runIO()));
// };

//String->IO[Array]
IO.$ = selectorString => new IO(_ => Array.from(document.querySelectorAll(selectorString)));

IO.$id = idString => new IO(_ => document.getElementById(idString));
IO.setStyle = (style, to) => node => new IO(_ => { node.style[style] = to; return node;}  );

const getNodeChildren = node => Array.from(node.children);


module.exports = IO;
},{}],12:[function(require,module,exports){
const {I}  = require('../../src/other-types/pointfree.js');

function Identity(v) {
  if (!(this instanceof Identity)) {
    return new Identity(v);
  }
  this.x = v;
}

Identity.prototype.of = x => new Identity(x);
Identity.of = Identity.prototype.of;

Identity.prototype.map = function(f) {
  return new Identity(f(this.x));
};
Identity.prototype.fold = function(f) {
  return f(x);
};
Identity.prototype.ap = function(app) {
  return app.map(this.x);
};
Identity.prototype.ap2 = function(b) {
  return new Identity(b.x(this.x));
};
Identity.prototype.sequence = function(of){
  return this.x.map(Identity.of); 
};
Identity.prototype.traverse = function(f, of){
  return this.x.map(f).sequence(of); 
};

//fold and chain are the same thing for Identitys
Identity.prototype.chain = Identity.prototype.reduce = Identity.prototype.fold = function(f) {
  return f(this.x);
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
},{"../../src/other-types/pointfree.js":25}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

Reader.prototype.map = function(f) {
  return this.chain( a => Reader.of(f(a)) );
};
Reader.prototype.contramap = function(f) {
  return this.chain( a => Reader.of(f(a)) );
};

Reader.prototype.sequence = function(of){
  //return of(this);//WRONG!!! Reader.of([3,4]).sequence(Array.of) is wrong with this!
  return this.run().map(Reader.of);
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
},{"../../src/other-types/pointfree.js":25}],15:[function(require,module,exports){
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
},{"../../src/other-types/pointfree.js":25,"./Identity":12,"./Tuple":19,"./utility":26}],16:[function(require,module,exports){
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

// gets the value, and also ensures that it's set to whatever it got?
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{"../../src/other-types/monoids.js":24,"../../src/other-types/pointfree.js":25}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
const {curry, K, I, mconcat, ap}  = require('../../src/other-types/pointfree.js');

function Validation(){
  throw new Error("Not called directly");
}

const Failure = function(x){
  if (!(this instanceof Failure)) {
    return new Failure(x);
  }
  if(x==null || !x.concat){
    throw new Error("Failure values must have a concat method (e.g. Strings, Arrays, etc.)")
  }
  this.e = x;//storing the value
};

Failure.prototype = Object.create(Validation.prototype);

const Success = function(x){
  if (!(this instanceof Success)) {
    return new Success(x);
  }
  this.s = x;//storing the value
};

Success.prototype = Object.create(Validation.prototype);

//let's create a cata interface with which we can define many of the others
Failure.prototype.cata = function({Failure}){ return Failure(this.e) };
Success.prototype.cata = function({Success}){ return Success(this.s) };

Validation.prototype.fold = Validation.prototype.reduce = function(f, g) {
  return this.cata({
    Failure: f,
    Success: g
  });
};

Validation.prototype.map = function(f) {
  return this.cata({
    Failure: e => this,
    Success: e => Success(f(e))
  });
};


Failure.prototype.ap = function(b) {
  return b.cata({
    Failure: e => Failure(this.e.concat(e)),
    Success: s => this
  });
}

Success.prototype.ap = function(b) {
  return b.cata({
    Failure: e => b,
    Success: s => b.map(this.s)
  });
}

Validation.prototype.getOrElse = function(a) {
  return this.cata({
    Failure: e => a,
    Success: _ => this.s
  });
}

Success.prototype.concat = function(b) {
  return b.cata({
    Failure: e => b,
    Success: s => b.map(bs=>this.s.concat(bs))
  });
}

Failure.prototype.concat = function(b) {
  return b.cata({
    Failure: e => Failure(this.e.concat(e)),
    Success: s => this
  });
}

//https://github.com/fantasyland/fantasy-validations/blob/master/src/validation.js#L44-L54
// Validation.prototype.concat = function(b) {
//     return this.fold(
//         f => {
//             return b.bimap(
//                 g => f.concat(g),
//                 identity
//             );
//         },
//         s => b.map(d => s.concat(d))
//     );
// };

Validation.prototype.getOrElse = function(a) {
  return this.cata({
    Failure: e => a,
    Success: _ => this.s
  });
}


//probably not right
Failure.prototype.sequence = function(of) {
  return this.e.map(Failure);
}

Success.prototype.sequence = function(of) {
  return this.s.map(Failure);
}

Validation.prototype.leftMap = function(f) {
  return this.cata({
    Failure: e => Failure(f(e)),
    Success: _ => this
  });
}


Object.assign(Validation.prototype,{
  of: x => new Success(x),
  fromNullable: a => a != null ? new Success(a) : new Failure(a),
  //toEither: ,
  //toMaybe: ,
  fromEither: a => a.fold(Failure, Success),
  fromMaybe: a => a.fold(Failure('No value'), Success),
  toPromise: function(){
    return this.cata({
      Failure: e => Promise.reject(e),
      Success: s => Promise.of(s)
    })
  }
});

Validation.of = Validation.prototype.of;
Validation.fromNullable = Validation.prototype.fromNullable;
Validation.fromMaybe = Validation.prototype.fromMaybe;
Validation.fromEither = Validation.prototype.fromEither;

//nope: need the value to return a success...
const mconcatv = x => mconcat(x, Validation.of(x));


//not quite working, is traverse wrong?
const aggregateValidationsFailed = (...testList) => testValue => testList.traverse(test=>test(testValue), Validation.of);

const aggregateValidations = (arrayOfTests) => arrayOfTests.length ?
  compose(mconcat, ap(arrayOfTests), Array.of) ://concat
  x => Success(x);//empty case is usually a mistake, but it returns the original value at least

//run values over matching lists, then concat all the lists to get the final validation of all values, success/fail list

module.exports = {
  Validation,
  Failure,
  Success,
  aggregateValidations
};
},{"../../src/other-types/pointfree.js":25}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){

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
},{}],23:[function(require,module,exports){
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
      return traverse(this.of, f)
    }

    const makeLenses = (...paths) => paths.reduce( 
      (acc, key) => W(objectLens(key))(set)(acc),// set(objectLens(key), objectLens(key), acc)//at lens location, set the lens!
      { num : arrayLens, mapped }
    );




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






},{"../../src/other-types/Const.js":6,"../../src/other-types/Identity.js":12,"../../src/other-types/pointfree.js":25}],24:[function(require,module,exports){
//concatenation is composition with one type (closed composition)

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


//Max 
//Min, etc. all require some further constraints, like Ord

const getResult = M => M.getResult ? M.getResult() : M.x;

module.exports = {
  Sum,
  Any,
  All,
  Endo,
  getResult,
  Max
}
},{}],25:[function(require,module,exports){
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

const binaryRight = x => _ => s => s(x);//Task.of is defined this way!

//String -> Object -> Arguments -> ?
const invoke = curry(
  (methodname, obj) => (...args) => obj[methodname](...args)
);

const ap = curry((A, A2) => A.ap(A2));
const map = curry((f, F) => F.map(x=>f(x)));//guard against Array.map
const reduce = curry((f, acc, F) => F.reduce(f,acc));
const chain = curry((f, M) => M.chain(f));


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


const head = xs => xs.head || xs[0];
const init = xs => xs.slice(0,-1);
const tail = xs => xs.tail || xs.slice(1, Infinity);
const last = xs => xs.last ? xs.last() : xs.slice(-1)[0];
const prop = namespace => obj => obj[namespace];


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

const concat = curry( (x, y) => x.concat(y));
//inferring empty is not a great idea here...
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
var fold2 = curry(function(rfn, g, fldable) { return fldable.fold(rfn, g) })



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

const traverse = curry( (f, point, Functor) => Functor.map(f).sequence(point) );

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
  foldMap,
  lmap,
  rmap,
  dimap,
  iso: dimap,
  any,
  all,
  runIO
};
},{}],26:[function(require,module,exports){
(function (global){
const {curry}  = require('../../src/other-types/pointfree.js');

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
  booleanEquals
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../src/other-types/pointfree.js":25}]},{},[1]);
