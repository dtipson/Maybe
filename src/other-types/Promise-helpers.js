Promise.prototype.of = Promise.resolve;
Promise.of = x => Promise.resolve(x);
Promise.prototype.map = Promise.prototype.chain = Promise.prototype.then;
Promise.prototype.bimap = Promise.prototype.then;
Promise.prototype.fold = Promise.prototype.then;//is it really? 
//Yes: Promise.reject(9).fold(x=>acc+1, x=>x+1)->P10 Promises hold only one value
//not sure if tasks turn reject into a resolve like this tho

//mostly a copy of the parallelization logic that was necessary for folktale's Task.ap. Promise.race already gives this to us
// Promise.prototype.ap = function(that){
//   return new Promise((resolve, reject) => {
//     let func, 
//         funcLoaded = false,
//         val, 
//         valLoaded = false,
//         rejected = false,
//         allState;

//     const guardReject = x => {
//       if (!rejected){
//         rejected = true;
//         return reject(x);
//       }
//     };

//     const guardResolve = setter => x => {
//       if (rejected) {
//         return;
//       }

//       setter(x);

//       if (funcLoaded && valLoaded) {
//         return resolve(func(val));
//       } else {
//         return x;
//       }
//     };

//     const guardThis = guardResolve(fn => {
//       funcLoaded = true;
//       func = fn;
//     });

//     const guardThat = guardResolve(x => {
//       valLoaded = true;
//       val = x;
//     });

//     const thisState = this.then(guardThis, guardReject)
//     const thatState = that.then(guardThat, guardReject);

//   });
// };

//I think this might still be correct, maybe?
Promise.prototype.ap = function(p2){
  return Promise.all([this,p2]).then(([fn,x])=>fn(x));
}
//are these actually possible? in theory an applicative should be, but what would it even mean? How could you get a # of array items out? You can't know how many there would be until it resolves...
// Promise.prototype.sequence_no = function(point){
//   return point().concat(this.map);//.concat(this.map(x=>x.map()))
// };
// Promise.prototype.traverse_no = function(f, point){
//   return this.map(f).sequence(point);
// };



//create a Promise that will never resolve
Promise.empty = function _empty() {
  return new Promise(function() {});
};

//delegates to how race works: the first resolving OR rejecting wins
Promise.prototype.concat = function(that){
 return Promise.race([this,that]);
};

//first _resolving_ promise wins, otherwise the first rejecting
//seems to work? What is it called tho?
Promise.prototype.concat2 = function(that){
  return Promise.race([this,that]).catch(
  e => {
    console.log('one rejected');
    let resolved = {};
    return this.then(a=>{
      resolved = this;
      console.log('this resolved');
      return a;
    },b=>{
      return that.then(c=>{
        resolved = that;
        console.log('that resolved');
        return c;
      });
    }).then(x=> resolved.then ? resolved : Promise.reject(e), x=>Promise.reject(e));
  });
};

Promise.prototype.challenge = function(arr){
  return arr.reduce((acc,x) => acc.concat2(x), this);
}


//Task's version
/*function _concat(that) {
  var forkThis = this.fork;
  var forkThat = that.fork;

  return new Promise(function(resolve, reject) {
    var done = false;
    var allState;
    var thisState = forkThis(guard(reject), guard(resolve));
    var thatState = forkThat(guard(reject), guard(resolve));

    function guard(f) {
      return function(x) {
        if (!done) {
          done = true;
          return f(x);
        }
      };
    }
  });

};
*/

//???? just copied over from Task
Promise.prototype.orElse = function _orElse(f) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return f(a).fork(reject, resolve);
    }, function(b) {
      return resolve(b);
    });
  }, cleanup);
};



