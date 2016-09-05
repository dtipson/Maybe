//http://stackoverflow.com/questions/8766246/what-is-the-store-comonad
//very similar to lenses in some way: it's a getter/setter focused on a particular external context
const Store = function(set, get){
  if (!(this instanceof Store)) {
    return new Store(set, get);
  }
  this.set = set;
  this.get = get;
};

// gets the value, and also ensures that it's set to whatever it got?
Store.prototype.extract = function() {
    return this.set(this.get());
};

//acts like you're setting the value
Store.prototype.extend = function(f) {
    return Store(
        k => f(Store( this.set, _ => k)),//mind-boggling? alters set to avoid mutating the original value?
        this.get
    );
};

// Derived
//maps over the eventually extracted value
Store.prototype.map = function(f) {
    return this.extend( _ => f(this.get()) );
};

//sets the value via some function that takes the value as input
Store.prototype.over = function(f) {
    return this.set(f(this.get()));
};

module.exports = Store;