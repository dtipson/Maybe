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
//so, since Const "hides" a real value behind an ignored value, concat is actually going to concat the inner, hidden values behind the scenes.

Const.prototype.ap = function(fa) {
    return this.concat(fa);//concats inner values instead of running function: the function is the "ignored" outer here
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