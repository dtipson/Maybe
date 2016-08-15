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
        return acc.map(arr => p => [p].concat(arr) ).ap(x);
      },
      point([])
    );
};



Array.prototype.traverse = function(f, point){
    return this.map(f).sequence(point);
};