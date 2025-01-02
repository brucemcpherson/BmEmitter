import test from 'ava';
import {BmEmitter} from '../gas/Emitter.js'

test ('make new emitter', t=> {
  const e = new BmEmitter()
  t.true (e instanceof BmEmitter )
  t.is (e.eventNames.length, 0)
})

test('make an event and listener', t => {
  const e = new BmEmitter()
  e.on ('coo', ()=> {
    
  })
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('coo'), 1)
});

test('add listener to existing event', t => {
  const e = new BmEmitter()
  let x = 0
  e.on ('foo', ()=> {
    x++
  })
  e.on ('foo', ()=> {
    x++
  })
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('foo'), 2)
  e.emit('foo')
  t.is(x,2)
});

test('add same listener to existing event', t => {
  const e = new BmEmitter()
  let x = 0
  const func = ()=> {
    x++
  }
  e.on ('bar', func)
  e.on ('bar',func)
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('bar'), 1)
  e.emit ('bar')
  t.is(x,1)
});

test('check emit takes args',  t => {
  let x = 0
  const e = new BmEmitter()
  const func = (y)=> {
    x+=y
  }
  e.on ('far', func)
  e.emit ('far', 10)
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('far'), 1)
  t.is(x,10)

});

test('remove an event with strict', t => {
  const e = new BmEmitter(true)
  let x = 0
  const func = ()=> {
    x++
  }
  e.on ('rar', func)
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('rar'), 1)

  // check it fails if we omit the listener code
  t.throws (()=>e.off('rar', null))
  e.off ('rar', func)

  // check it fails now as its gone
  t.throws (()=>e.emit ('rar') )
  t.is (e.eventNames.length, 0)
  t.throws (()=>e.listenerCount('rar'))
 
});

test('event fires only once with strict', t => {
  const e = new BmEmitter(true)
  let x = 0
  const func = ()=> {
    x++
  }
  e.once ('oar', func)
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('oar'), 1)

  e.emit ('oar')

  // check it fails now as its gone
  t.throws (()=>e.emit ('oar') )
  t.is (e.eventNames.length, 0)
  t.throws (()=>e.listenerCount('oar'))
 
});

test('remove all listeners with strict', t => {
  const e = new BmEmitter(true)
  let x = 0
  const func = ()=> {
    x++
  }
  e.on ('tar', func)
  t.is (e.eventNames.length, 1)
  t.is (e.listenerCount('tar'), 1)

  // also removes the event
  e.removeAllListeners ('tar')

  // check it fails now as its gone
  t.throws (()=>e.emit ('tar') )
  t.is (e.eventNames.length, 0)
  t.throws (()=>e.listenerCount('tar'))
 
});
