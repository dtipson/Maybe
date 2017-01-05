const {Either, Right, Left}  = require('../../src/other-types/Either.js');
const {compose, I, lift}  = require('../../src/other-types/pointfree.js');

const takeLarger = x => y => x > y ? x : y;
const takeSmaller = x => y => x < y ? x : y;

//for 2 already sorted lists
const mergeSort = (xs, ys) => {
  if(!xs.length){
    return ys;
  }
  else if(!ys.length){
    return xs
  }
  else if (head(xs)<head(ys)){
    return [head(xs)].concat( mergeSort(tail(xs), ys) )
  }
  else{
    return [head(ys)].concat( mergeSort(xs, tail(ys)) )
  }
}


//now we're trying to work this out in terms of Either
const mergeSort2 = (xs, ys) => {
  return smallerHead(xs,ys)
}


//smallerHead :: Array -> Array -> a
const smallerHead = (xs, ys) => {
  return Either.safeHead(xs)
    .orElse(Infinity)
    .map(takeSmaller)
    .ap(
      Either.safeHead(ys).orElse(Infinity)
    )
}

//trying 
//......
const takeSmallerRec = xs => ys => x => y => x < y ? 
  [x].concat(takeSmallerRec(tail(xs),ys)) : 
  [y].concat(takeSmallerRec(xs, tail(ys)));

//smallerHead :: Array -> Array -> a
const smallerHeadSort = (xs, ys) => {
  return Either.safeHead(xs)
    //.orElse(Infinity)
    .map(takeSmallerRec(xs,ys))
    .ap(
      Either.safeHead(ys)//.orElse(Infinity)
    )
    .fold(_=>[],I)//nope
}



module.exports = {
  mergeSort,
  takeLarger,
  takeSmaller,
  smallerHead
}
//mergeSort([1,5,89,100],[2,3,4,5,8,90])