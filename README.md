# Maybe
Quick, instructional implementation of the Maybe Type in FP javascript, with tests

Exports Maybe, Nothing, & Just

```
Nothing.getOrElse(4);//-> 4
Maybe.maybe(8, x=>x+1, Just(7));//-> 8
Just([4]).sequence(Array.of);//-> [Just[4]]
Just([4]).sequence(Array.of).filter(x=>!4);//[]
Just([4]).sequence(Array.of).filter(x=>!4).sequence(Maybe.of);//-> Just([])
Just([4]).sequence(Array.of).filter(x=>!4).sequence(Maybe.of).concat(Just([6]));//-> Just([6])
```

`npm run test` to run tests: the primary pedagogical purpose for this repo is thinking through what, in addition to the lawful tests, would make good tests
