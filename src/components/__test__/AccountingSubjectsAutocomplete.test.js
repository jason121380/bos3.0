import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import React from 'react'
import { spy } from 'sinon'

import AccountingSubjectsAutocomplete, {
  ACCOUNTING_SUBJECTS,
} from '../AccountingSubjectsAutocomplete'

describe('<AccountingSubjectsAutocomplete />', () => {
  let mocks = []
  let wrapper = null
  afterEach(() => {
    cleanup()
    mocks = []
  })

  beforeEach(() => {
    jest.resetAllMocks()
    wrapper = null
  })

  test('select an option', async () => {
    const handleChange = spy()
    mocks = [
      {
        request: {
          query: ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
              },
            ],
          },
        },
      },
    ]
    wrapper = render(
      <CustomMockedProvider mocks={mocks}>
        <AccountingSubjectsAutocomplete onChange={handleChange} />
      </CustomMockedProvider>
    )

    await new Promise(resolve => setTimeout(() => resolve(), 0))
    const textbox = screen.getByRole('textbox')

    const selectedValue = {
      title: 'name',
      value: '1',
      number: 1,
      inoutType: 'REVENUE',
    }
    fireEvent.keyDown(textbox, { key: 'ArrowDown' })
    fireEvent.keyDown(textbox, { key: 'ArrowDown' })
    fireEvent.keyDown(textbox, { key: 'Enter' })

    expect(handleChange.callCount).toEqual(1)
    expect(handleChange.args[0][1]).toEqual(selectedValue)
    expect(handleChange.args[0][2]).toEqual('select-option')
    expect(handleChange.args[0][3]).toEqual({ option: selectedValue })
  })

  it('should render options correctly', async () => {
    mocks = [
      {
        request: {
          query: ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
              },
              {
                id: '2',
                name: 'name2',
                number: 2,
                inoutType: 'REVENUE2',
              },
            ],
          },
        },
      },
    ]
    wrapper = render(
      <CustomMockedProvider mocks={mocks}>
        <AccountingSubjectsAutocomplete open />
      </CustomMockedProvider>
    )
    await new Promise(resolve => setTimeout(() => resolve(), 0))
    const options = wrapper.getAllByRole('option')
    expect(options).toHaveLength(2)
  })

  it('should render selectd value option text on Input', async () => {
    mocks = [
      {
        request: {
          query: ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
              },
            ],
          },
        },
      },
    ]

    const selectedValue = {
      title: 'name',
      value: '1',
      number: 1,
      inoutType: 'REVENUE',
    }
    wrapper = render(
      <CustomMockedProvider mocks={mocks}>
        <AccountingSubjectsAutocomplete open value={selectedValue} autoFocus />
      </CustomMockedProvider>
    )
    await new Promise(resolve => setTimeout(() => resolve(), 0))
    const textbox = wrapper.queryByText('1 name')
    expect(textbox).not.toBeNull()
  })
})
