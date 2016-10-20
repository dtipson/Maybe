//because functions need help too

const {S}  = require('../../src/other-types/pointfree.js');

    //Baby's First Reader
    Function.of = x => _ => x;
    Function.prototype.map = function(f) {
        return x => f(this(x));//composition
    }
    //const isTwo = a => a===2
    //const notTwo = isTwo.map(x=>!x)

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