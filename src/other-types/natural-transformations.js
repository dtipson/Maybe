const Task  = require('../../src/other-types/Task.js');

//natural transformation
const idToTask = i => i.fold(Task.of);
const maybeToTaskWMsg = msg => m => m.reduce((acc,x)=>Task.of(x), Task.rejected(msg));
const maybeToTask = maybeToTaskWMsg(null);
const maybeToIO = m => m.reduce((acc,x)=>IO.of(x), IO.of(undefined));
const maybeToEither = m => m.reduce((acc,x)=>Either.of(x), Left(null));
const eitherToTask = e => e.fold(Task.rejected, Task.of);
const ioToTask = i => new Task((rej, res) => res(i.runIO()));
const readerToTask = r => new Task((rej,res)=>res(r.run()));
//const eitherToIO = e => e.fold(x=>IO.of(undefined),x=>IO.of(x))
const idToArray = id => [id.fold(I)];

//safeHead/Maybe.head IS a natural transformation! Array -> Maybe
//so is Map({hi:true}).toArray()
//reverse?
const maybeToArray = m => m.cata({Just:x=>[x],Nothing:_=>[]});// or, m.reduce((acc,x)=>acc.concat(x),[]);
const readerToMaybe = r => fromNullable(r.run());//I don't think so... https://bartoszmilewski.com/2015/04/07/natural-transformations/

/*
[[1,5,6],['a','b','c']].chain(Maybe.head).sequence(Maybe.of)
t1(t2).chain(nt t2->t3).sequence(t3.of)

.chain(f).sequence(of) = ???

other examples of this pattern?

Just(Just(9)).map(maybeToEither).sequence()




Task.of('#email')
  .map(IO.$)
  .chain(ioToTask)
  .map(Maybe.head)
  .chain(maybeToTask)
  .map(IO.setAttr('value','dtipsonsyasdasdasd@gmail.com'))
  .chain(ioToTask)
  .fork(e=>console.log(e), I);



*/

/*
Db.find Task of an Either(user|null)
//ways of dealing with nested types: MonadTransformers/natural transformations

Db.find => Task(Either)


Db.find(1)
  .chain(eitherToTask)//-> now everything is a task, though either branch is lost
  .chain(u=>Db.find(u.best_friend_id))
  .chain(eitherToTask)
  .fork(error => send(500,{error}), u=>send(200,u));

//with natural transformation, we lose one of the error paths: it's collapsed

//natural transformation: order of this shouldn't matter
(map(f), nt) == (nt, map(f))

//alternative, using traverse to keep types, and both branches

Db.find(1)
  .chain(eu=>
    eu.traverse(Task.of, u=>Db.find(u.best_friend_id))
  )
  .chain(eeu=>eeu.chain(x=>x))
  .fork(e=>send(500,{e}), eu => eu.fold(e=>404,I));



  Map({
    cu:getUser(4),
    timeline: getTime(4)
  })
    .traverse(Task.of, I)
    .fork(e=>console.error(e),x=>console.log(x))

*/

module.exports = {
  idToTask,
  eitherToTask,
  ioToTask,
  readerToTask,
  idToArray,
  maybeToArray,
  readerToMaybe,
  maybeToTask,
  maybeToTaskWMsg,
  maybeToEither,
  maybeToIO
}