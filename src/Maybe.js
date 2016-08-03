const Nothing = (function(){
  const Nothing = function(){
    if (!(this instanceof Nothing)) {
      return new Nothing();
    }
  };
  Nothing.prototype.ap = Nothing.prototype.chain = Nothing.prototype.map = Nothing.prototype.filter = function(){ return this; };
  Nothing.prototype.sequence = function(of){ return of(this); };
  Nothing.prototype.traverse = function(fn, of){ return of(this); };
  Nothing.prototype.reduce = (f, x) => x,
  Nothing.prototype.getOrElse = Nothing.prototype.concat = x => x;
  Nothing.prototype.cata = ({Nothing}) => Nothing();  //not the Nothing type constructor here, btw, a prop named Nothing!
  Nothing.prototype.equals = function(y){return y==this;};//setoid
  Nothing.prototype.toString = _ => 'Nothing';

  return Nothing();

})();//result will fail an instanceof Nothing check, because "Nothing" is not the Nothing constructor in the outer scope

const Just = function(x){
  if (!(this instanceof Just)) {
    return new Just(x);
  }
  this.value = x;
};
Just.prototype.map = function(f){ return new Just(f(this.value)); };
Just.prototype.ap = function(b){ return b.map(this.value); };
Just.prototype.chain = function(f){ return f(this.value); };
Just.prototype.sequence = function(of){ return this.value.map(Just); };
Just.prototype.traverse = function(fn, of){ return this.map(fn).sequence(of); };
Just.prototype.toString = function(){ return `Just(${this.value})`; };
Just.prototype.reduce = function(fn, acc) { return fn(acc, this.value); };
Just.prototype.filter = function(fn){ return this.chain(x=> fn(x)? this : Nothing ); };
Just.prototype.concat = function(b){ 
  return b.value && !Maybe.isNull(b.value) ? Just(this.value.concat(b.value)) : this 
};
Just.prototype.equals = function(y){ return y.value === this.value; };
Just.prototype.getOrElse = function(){ return this.value; }
Just.prototype.cata = function({Just}){ return Just(this.value) };

const Maybe = {
  of: x => new Just(x),
  empty: _ => Nothing,
  toBool: m => m!==Nothing,//reduce value/no value to true or false
  isNull: x=> x===null || x===undefined,
  fromNullable: x=> Maybe.isNull(x) ? Nothing : Just(x),
  maybe: function(nothingVal, justFn, m) {
    return m.reduce(function(_, x) {
      return justFn(x);
    }, nothingVal);
  }
};

module.exports = {
  Maybe,
  Just,
  Nothing
};