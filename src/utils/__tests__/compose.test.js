// 保護：compose(modules, component) 由右到左逐層包裝：compose([f, g], C) === f(g(C))。
// Jason 2026/10/22 fix all：原本迴圈對第二個之後的 module 只呼叫 first(module) 並丟棄結果，實際只得到 first(C)；
// 唯一使用處 PaymentAutoComplete 改為 compose([memo, forwardRef], C)，得到 memo(forwardRef(C))（真的被 memo 包起來、ref 仍可用）。
import React from 'react'
import compose from 'utils/compose'
import PaymentAutoComplete from 'components/PaymentAutoComplete'

describe('compose', () => {
  it('由右到左逐層包裝，每個 module 各呼叫一次', () => {
    const calls = []
    const wrap = name => x => {
      calls.push([name, x])
      return `${name}(${x})`
    }
    expect(compose([wrap('a'), wrap('b'), wrap('c')], 'C')).toBe('a(b(c(C)))')
    expect(calls).toEqual([
      ['c', 'C'],
      ['b', 'c(C)'],
      ['a', 'b(c(C))'],
    ])
  })

  it('只有一個 module 時直接包住 component；沒有 module 時原樣回傳', () => {
    expect(compose([x => `m(${x})`], 'C')).toBe('m(C)')
    expect(compose([], 'C')).toBe('C')
  })

  it('compose([memo, forwardRef], C) 得到 memo(forwardRef(C))', () => {
    const C = (props, ref) => <div ref={ref} />
    const result = compose([React.memo, React.forwardRef], C)
    expect(result.$$typeof).toBe(Symbol.for('react.memo'))
    expect(result.type.$$typeof).toBe(Symbol.for('react.forward_ref'))
    expect(result.type.render).toBe(C)
  })

  it('PaymentAutoComplete 是 memo(forwardRef(...))', () => {
    expect(PaymentAutoComplete.$$typeof).toBe(Symbol.for('react.memo'))
    expect(PaymentAutoComplete.type.$$typeof).toBe(Symbol.for('react.forward_ref'))
  })
})
