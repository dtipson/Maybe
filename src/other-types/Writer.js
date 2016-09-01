function Writer(l, v) {
  if (!(this instanceof Writer)) {
    return new Writer(l,v);
  }
  this[0] = String(l).trim();//log
  this[1] = v;//value
}

Writer.of = (x) => new Writer('', x);//'' is the "empty" type of string
Writer.prototype.of = Writer.of;

Writer.prototype.chain = function(f){
  const tuple = f(this[1]);
  return new Writer(this[0].concat(' ',tuple[0]), tuple[1]);
}
Writer.prototype.map = function(f){
  return new Writer( this[0], f(this[1]) );
}
Writer.prototype.ap = function(wr){
  return Writer( this[0].concat(' ', wr[0]), this[1](wr[1]) );
}
Writer.prototype.fst = function(){return this[0]};
Writer.prototype.snd = function(){return this[1]};
Writer.prototype.swap = function(){return Writer(this[1],this[0])};


const writerize = Writer.lift = (log, fn) => x => Writer(log, fn(x));


//semigroup
Writer.prototype.concat = function(wr){
  return Writer( this[0].concat(' ',wr[0]), this[1].concat(wr[1]) );
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