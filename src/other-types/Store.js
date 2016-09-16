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

//alters the setter such that the result of f is what gets extracted
Store.prototype.extend = function(f) {
    return Store(
        k => f(Store( this.set, _ => k)),//mind-boggling? alters set to avoid mutating the original value?
        this.get//so extend can never change the getter, I guess?
    );
};

// Store(x=>t.foo=x,x=>t.foo).extend(st=>5).extract();//-> 5

// Store.prototype.extend2 = function(f) {
//     var self = this;
//     return Store(
//         (k) => {
//             return f(Store(
//                 self.set,
//                 () => k
//             ));
//         },
//         this.get
//     );
// };

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