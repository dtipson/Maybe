function Const(value) {
  if (!(this instanceof Const)) {
    return new Const(value);
  }
  this.value = value;
}
Const.of = x => new Const(x);

Const.prototype.map = function() {
  return this;
};

module.exports = Const;


/*

  reduce is then 
  .prototype = function(f, acc) {
    const thisAcc = x => Const(acc);
    Const.prototype.ap = function(b) {
      return new Const(f(this.value, b.value));
    };
    return this.map(x => new Const(x)).sequence(thisAcc).value; 
  }

*/