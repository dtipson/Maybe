//because functions need help too

const {S}  = require('../../src/other-types/pointfree.js');

    //Baby's First Reader
    Function.of = x => _ => x;
    // Function.prototype.join = function(){
    //     ???
    // }
    Function.prototype.map = function(f) {
        return x => f(this(x));//just composition
    }
    //chain for functions allows you to sub in a function that takes two arguments, effectively having a value get transformed by the monad for the first argument, then also passed in again clean as the second
    //head.chain(append) -> [3,4,5] -> [3,4,5,3]
    //(a -> (x -> b)) -> (x -> a) -> (x -> b)
    //put another way, we can glue a->x and x -> a -> b together, for the same a
    Function.prototype.chain = function(f) {
        return x => f(this(x))(x)//supposedly this is akin to the reader monad?
    }

  //function version
  // if (typeof monad === 'function') {
  //   return function(x) { return fn(monad(x))(x); };
  // }



    //const isTwo = a => a===2
    //const notTwo = isTwo.map(x=>!x)

    //S NEEDS to be curried here for this to work
    Function.prototype.ap = function(f) {
        return S(this)(f);// equivalent to returning x => this(x)(f(x))
    }

    Function.prototype.contramap = function(f) {
        return x => this(f(x));//composition in reverse order
    }
    //const isOne = isTwo.contramap(x=>x+1)

    //have to think about the order of arguments
    Function.prototype.dimap = function(c2d, a2b) {
        return x => c2d( this( a2b(x) ) );//or, compose(c2d, this,a 2b)
    }
    //notOne = isTwo.dimap(x=>!x, x=>x+1)

    Function.prototype.dimap = function(c2d, a2b) {
        return this.contramap(a2b).map(c2d);
    }