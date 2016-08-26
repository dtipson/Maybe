# Maybe
Quick, instructional implementation of the Maybe Type in FP javascript, with tests

`npm run test` to run tests: the primary pedagogical purpose for this repo is thinking through what would make good tests of all the interfaces (the lawful tests, demonstration operations, etc.)

Just because this library does it doesn't mean it's right, or a good idea.  This is my personal playground for FP types.  All corrections welcome!


The main lib exports `Maybe`, `Nothing`, & `Just`

The extended lib (also available on the index page) implements `Cont, Const, Either, Identity, IO, Maybe, Reader, State (&T), Tuple, & Writer`.  It also enhances Array and Promise to make them conform to [fantasy-land](https://github.com/fantasyland/fantasy-land)

```
Just(5).getOrElse(4);//-> 5
Nothing.getOrElse(4);//-> 4

Just(3).cata({
  Just: x => Just(x+1),
  Nothing: () => Just(4)
});//-> 4

Nothing.cata({
  Just: x => Just(x+1),
  Nothing: () => Just(4)
});//-> 4

//all the which ways you might find the need to add two Justs to a binary function
Just(9).map(x=>y=>x+y).ap(Just(9));//-> Just[18]
Just(9).chain(x=>Just(9).chain(y=>x+y));//-> Just[18]
Just(x=>y=>x+y).ap(Just(9)).ap(Just(9));//-> Just[18]
liftA2(x=>y=>x+y, Just(9),Just(9));//-> Just[18]

//And if you happen to include a Nothing somewhere...
Nothing.chain(x=>Just(9).chain(y=>x+y));//-> Nothing

//a Nothing can be treated as false
Boolean(Number(Nothing));//-> false
Nothing.toBoolean();//-> false

//...while Justs are always treated as true
Just(undefined).toBoolean();//-> true

//there are ways to resolve the ambiguity of Just/Nothing
Nothing.orElse(Just(9));//-> Just[9]

//There are ways to fold types into a value
maybe(8, x=>x+1, Just(7));//-> 8
maybe(8, x=>x+1, Nothing);//-> 8


//the utility of the Type is the ability to emit the lack of a value without breaking composition...
const mockApi = id => id===1 ? Just({record:1}) : Nothing;

mockApi(2).map(x=>window.alert(x));//-> nothing happens
mockApi(1).map(x=>window.alert(x));//-> alerts {record:1}

//or, with Array/Promise prototype extension helpers added... let's do some type gymnastics!

[Just(4),Nothing,Just(5)].filter(x => x.toBoolean());//-> [Just[4],Just[5]]
[Just(4),Nothing,Just(5)].filter(Maybe.toBoolean).sequence(Maybe.of);//-> Just[[4,5]]

Just([4]).sequence(Array.of);//-> [Just[4]]

 Just([4,5]).map(arr=>arr.filter(x=>x!==4));//-> Just[[5]]
 Just([4,5]).sequence(Array.of);//-> [Just[4], Just[5]]
 Just([4,5]).sequence(Array.of).filter(x => x.filter(x=>x!==4).toBoolean());//-> [Just[5]]
 Just([4,5]).sequence(Array.of).map(x=>x.reduce((acc,x)=>x));//-> [4, 5]
 Just([4]).sequence(Array.of).map(x=>5);//-> [5]
 Just([4,4]).sequence(Array.of).map(x=>x.map(x=>x+1));//-> [Just[5], Just[5]]
 Just([4,4]).sequence(Array.of).traverse(x=>x.map(x=>x+1), Maybe.of);//-> Just[[5, 5]]

Just([4]).sequence(Array.of).concat(Nothing);//-> [Just[4],Nothing]
Just([4]).sequence(Array.of).concat(Nothing).filter(Maybe.toBoolean).sequence(Maybe.of);//-> Just[[4]]
Just([4]).sequence(Array.of).filter(x => !4).sequence(Maybe.of).concat(Just([6]));//-> Just[[6]]

[1,2].map(mockApi);//-> [Nothing, Just[{record:1}]]
[1,2].map(mockApi).filter(Maybe.toBoolean).sequence(Maybe.of);//-> Just[[{record:1}]] 
[1,2].map(mockApi).filter(Maybe.toBoolean)[0];//-> Just[{record:1}] not safe to work with though, so...

//safe
([1,2].map(mockApi).filter(Maybe.toBoolean)[0]||Nothing);//-> Just[{record}]
([2,3].map(mockApi).filter(Maybe.toBoolean)[0]||Nothing);//-> Nothing

//also safe
[1,1].map(mockApi).filter(Maybe.toBoolean).reduceRight( (acc, x) => x, Nothing);//-> Just[{record:1}]
[2,3].map(mockApi).filter(Maybe.toBoolean).reduceRight( (acc, x) => x, Nothing);//-> Nothing

Array.of(Just([4]));//-> ew, a type within type within type! [Just[[4]]]
Array.of(Just([4])).sequence(Maybe.of);//-> flip the outer two layers: Just[[[4]]]
Array.of(Just([4])).sequence(Maybe.of).map(x=>x.flatten());//-> flatten out the inner arrays: Just[[4]]
Array.of(Just([4])).sequence(Maybe.of).map(x=>x.flatten()).map(x=>x[0]);//-> grab the first inner element: Just[4]
Array.of(Just([4])).sequence(Maybe.of).map(x=>x.flatten()).map(x=>x[0]).getOrElse(null);//-> extract the value w/ fallback:  4

[1,2].traverse(actualApi, Promise.of);//-> Promise[[result, result]] Array of promises becomes a promise of Arrays
```

Heck, I mean...

```
[IO.of(9),IO.of(7)].sequence(IO.of).runUnsafe();//-> [9,7]

Continuation.of(1).run(x=>x+1) + Continuation(x=>x+1).run(1);//-> 4
Promise.all([Promise.of(x=>x+1).ap(Promise.of(1)),Promise.of(1).map(x=>x+1)]).then(([x,y])=>x+y);//->Promise[4]

```

Or, like:

```
aggregate(x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']))(8);//-> ["not 3","not 3","not 3"]

aggregate(x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']))(3);//-> Success[3]