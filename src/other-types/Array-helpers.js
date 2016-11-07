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
Array.prototype.flap = function(a) {
  //??? reversed version?
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
//from fantasyland: https://github.com/safareli/fantasy-land/blob/98e363427c32a67288d45063b0a5627b912ee8b6/internal/patch.js#L13
//do these use the reversed .ap?
Array.prototype.flsequence = function(f, p) {
  return this.map(f).reduce(
    (ys, x) => ys.ap(x.map(y => z => z.concat(y))),
    p([])
  );
};
Array.prototype.fltraverse = function(f, p) {
  return this.map(f).reduce(
    (ys, x) => ys.ap(x.map(y => z => z.concat(y))),
    p([])
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
    return this.map(f).sequence(point);
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

