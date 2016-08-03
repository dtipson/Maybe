# Maybe
Quick, instructional implementation of the Maybe Type in FP javascript, with tests

Exports Maybe, Nothing, & Just

```
Nothing.getOrElse(4);//-> 4

Maybe.maybe(8, x=>x+1, Just(7));//-> 8


const mockApi = id => id===1 ? Just({record:1}) : Nothing;

mockApi(2).map(x=>window.alert(x));//-> nothing happens
mockApi(1).map(x=>window.alert(x));//-> alerts {record:1}

//or, with Array/Promise prototype extension helpers, some gymnastics

Just([4]).sequence(Array.of);//-> [Just[4]]
 Just([4,5]).sequence(Array.of).filter(x => Maybe.toBool(x.filter(x=>x!==4)));//-> Just[5]
 Just([4,5]).map(arr=>arr.filter(x=>x!==4));//-> Just[5]
 Just([4]).sequence(Array.of).map(x=>x.reduce((acc,x)=>x, 5)) -> [5]
 Just([4]).sequence(Array.of).map(x=>5) -> [5]
 Just([4]).sequence(Array.of).map(x=>x.map(x=>x+1));//-> Just[5]
Just([4]).sequence(Array.of).filter(x => !4).sequence(Maybe.of);//-> Just[[]]
Just([4]).sequence(Array.of).filter(x => !4).sequence(Maybe.of).concat(Just([6]));//-> Just[[6]]


Array.of(Just([4]));//-> ew, a type within type within type! [Just[[4]]]
Array.of(Just([4])).sequence(Just);//-> flip the outer two layers: Just[[[4]]]
Array.of(Just([4])).sequence(Just).map(x=>x.flatten());//-> flatten out the inner arrays: Just[[4]]
Array.of(Just([4])).sequence(Just).map(x=>x.flatten()).map(x=>x[0]);//-> grab the first inner element: Just[4]
Array.of(Just([4])).sequence(Just).map(x=>x.flatten()).map(x=>x[0]).getOrElse(null);//-> extract the value w/ fallback:  4
```

`npm run test` to run tests: the primary pedagogical purpose for this repo is thinking through what would make good tests of all the interfaces (the lawful tests, demonstration operations, etc.)
