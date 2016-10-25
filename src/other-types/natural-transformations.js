const Task  = require('../../src/other-types/Task.js');
const Either  = require('../../src/other-types/Either.js');
const IO  = require('../../src/other-types/IO.js');

//natural transformation
const eitherToTask = e => e.fold(Task.rejected,Task.of);
const ioToTask = i => new Task((rej, res) => res(i.runIO()));
const readerToTask = r => new Task((rej,res)=>res(r.run()))

/*
Db.find Task of an Either(user|null)
//ways of dealing with nested types: MonadTransformers/natural transformations

Db.find(1)
  .chain(eitherToTask)
  .chain(u=>Db.find(u.best_friend_id))
  .chain(eitherToTask)
  .fork(error => send(500,{error}), u=>send(200,u));

//with natural transformation, we lose one of the error paths: it's collapsed

//natural transformation: order of this shouldn't matter
(map(f), nt) == (nt, map(f))

//alternative 

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
  eitherToTask,
  ioToTask
}