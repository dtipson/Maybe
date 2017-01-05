const {I, getInstance}  = require('../../src/other-types/pointfree.js');

function RemoteData(){
  throw new TypeError('Constructor cannot be called directly');
}

const NotAsked = function(){
  if (!(this instanceof NotAsked)) {
    return new NotAsked();
  }
};

const Requested = function(r){
  if (!(this instanceof Requested)) {
    return new Requested(r);
  }
  this.x = r;//resource pointer
};
const Loading = function(l){
  if (!(this instanceof Loading)) {
    return new Loading(l);
  }
  this.x = l;//request meta data
};
const Failure = function(e){
  if (!(this instanceof Failure)) {
    return new Failure(e);
  }
  this.x = e;//error type
};
const Success = function(s){
  if (!(this instanceof Success)) {
    return new Success(s);
  }
  this.x = s;//expected type
};

const subtypes = [NotAsked,Requested,Loading,Failure,Success];

subtypes.forEach(type=>{
  type.prototype = Object.create(RemoteData.prototype);
  type.prototype.name = type.name;
  RemoteData[type.name] = type;
  RemoteData.prototype[`if${type.name}`] = function(f){
    return this.name===type.name? f(this.x) : this;
  }
});

RemoteData.NotAsked = NotAsked();//only ever need the one instance

RemoteData.of = x => Success(x);

RemoteData.prototype.cata = function(dispatches){
  console.log(`name: ${typeof this}`)
  return dispatches[this.name](this.x);
}

RemoteData.prototype.chain = function(f){
  return this.cata({
    NotAsked: _=>this,
    Requested: _=>this,
    Loading: _=>this,
    Failure: _=>this,
    Success: s => f(s)
  })
}

RemoteData.prototype.fold = function(lf,ef,sf){
  return this.cata({
    NotAsked: _=>null,
    Requested: _=>null,
    Loading: _=>lf(this.x),
    Failure: _=>ef(this.x),
    Success: _=>sf(this.x)
  })
}

RemoteData.prototype.map = function(f){
  return this.chain(x=>Success.of(f(x)));
} 

module.exports = RemoteData;