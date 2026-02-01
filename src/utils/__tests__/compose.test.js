import React from 'react'
import compose from 'utils/compose'

describe('compose', () => {
  it('should called every module success', () => {
    const spyMemo = jest.spyOn(React, 'memo')

    const spyForwardRef = jest.spyOn(React, 'forwardRef')

    const MockedComponent = () => <div>123</div>

    const functions = [spyMemo, spyForwardRef]

    compose(functions, MockedComponent)

    expect(spyMemo).toHaveBeenCalled()
  })
})
