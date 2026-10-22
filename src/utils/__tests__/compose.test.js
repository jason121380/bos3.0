// 保護：compose(modules, component) 的實際行為——回傳「第一個 module 包住 component」的結果。
// 已知缺口（待 Jason 決定）：迴圈對第二個之後的 module 只呼叫 first(module) 並丟棄結果，並不是由右到左逐層包裝；
// 目前唯一使用處（PaymentAutoComplete：compose([memo, forwardRef], C)）因此只得到 memo(C)。
import React from 'react'
import compose from 'utils/compose'

describe('compose', () => {
  it('第一個 module 會被呼叫，並以 component 呼叫一次作為回傳值', () => {
    const spyMemo = jest.spyOn(React, 'memo')
    const spyForwardRef = jest.spyOn(React, 'forwardRef')
    const MockedComponent = () => <div>123</div>

    const result = compose([spyMemo, spyForwardRef], MockedComponent)

    expect(spyMemo).toHaveBeenCalledWith(MockedComponent)
    expect(result).toBe(spyMemo.mock.results[spyMemo.mock.calls.length - 1].value)
    spyMemo.mockRestore()
    spyForwardRef.mockRestore()
  })

  it('目前行為：後面的 module 只被當成參數傳給第一個，本身不會包住 component', () => {
    const calls = []
    const a = x => {
      calls.push(['a', x])
      return `a(${typeof x === 'string' ? x : 'fn'})`
    }
    const b = x => {
      calls.push(['b', x])
      return `b(${x})`
    }
    expect(compose([a, b], 'C')).toBe('a(C)')
    expect(calls).toEqual([
      ['a', b],
      ['a', 'C'],
    ])
  })

  it('只有一個 module 時直接包住 component', () => {
    expect(compose([x => `m(${x})`], 'C')).toBe('m(C)')
  })
})
