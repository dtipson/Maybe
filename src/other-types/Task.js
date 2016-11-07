

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
    return new Task(computation);
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
Task.to = method => resource => 
  new Task((rej,res) => resource[method]().then(res,rej))

module.exports = Task;