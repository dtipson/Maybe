Promise.prototype.of = Promise.resolve;
Promise.prototype.map = function(f){
  return this.then(x => f(x));
};
Promise.prototype.chain = Promise.prototype.then;
Promise.prototype.ap = function(that){//mostly a copy of the parallelization logic that was necessary for folktale's Task.ap
  return new Promise((resolve, reject) => {
    let func, 
        funcLoaded = false,
        val, 
        valLoaded = false,
        rejected = false,
        allState;

    const guardReject = x => {
      if (!rejected){
        rejected = true;
        return reject(x);
      }
    };

    const guardResolve = setter => x => {
      if (rejected) {
        return;
      }

      setter(x);

      if (funcLoaded && valLoaded) {
        return resolve(func(val));
      } else {
        return x;
      }
    };

    const guardThis = guardResolve(fn => {
      funcLoaded = true;
      func = fn;
    });

    const guardThat = guardResolve(x => {
      valLoaded = true;
      val = x;
    });

    const thisState = this.then(guardThis, guardReject)
    const thatState = that.then(guardThat, guardReject);

  });
};
Promise.prototype.sequence = function(point){
  return point(this);
};
Promise.prototype.traverse = function(f, point){
  return this.map(f).sequence(point);
};
Promise.of = x => Promise.resolve(x);