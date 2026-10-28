import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import React from 'react'
import { spy } from 'sinon'

import AccountingSubjectsAutocomplete from '../AccountingSubjectsAutocomplete'
import { GET_ACCOUNTING_SUBJECTS } from 'hooks/useFetchAccountingSubjects'

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
          query: GET_ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
                isUsing: true,
              },
            ],
          },
        },
      },
    ]
    wrapper = render(
      <CustomMockedProvider mocks={mocks}>
        <AccountingSubjectsAutocomplete onChange={handleChange} inoutType="REVENUE" />
      </CustomMockedProvider>
    )

    await new Promise(resolve => setTimeout(() => resolve(), 0))
    const textbox = screen.getByRole('combobox')

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
    expect(handleChange.args[0][2]).toEqual('selectOption')
    expect(handleChange.args[0][3]).toEqual({ option: selectedValue })
  })

  it('should render options correctly', async () => {
    mocks = [
      {
        request: {
          query: GET_ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
                isUsing: true,
              },
              {
                id: '2',
                name: 'name2',
                number: 2,
                inoutType: 'REVENUE',
                isUsing: true,
              },
            ],
          },
        },
      },
    ]
    wrapper = render(
      <CustomMockedProvider mocks={mocks}>
        <AccountingSubjectsAutocomplete open inoutType="REVENUE" />
      </CustomMockedProvider>
    )
    await new Promise(resolve => setTimeout(() => resolve(), 0))
    const options = await wait(() => wrapper.getAllByRole('option')).then(() => wrapper.getAllByRole('option'))
    expect(options).toHaveLength(2)
  })

  it('should render selectd value option text on Input', async () => {
    mocks = [
      {
        request: {
          query: GET_ACCOUNTING_SUBJECTS,
        },
        result: {
          data: {
            accountingSubjects: [
              {
                id: '1',
                name: 'name',
                number: 1,
                inoutType: 'REVENUE',
                isUsing: true,
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
        <AccountingSubjectsAutocomplete open inoutType="REVENUE" value={selectedValue} autoFocus />
      </CustomMockedProvider>
    )
    await new Promise(resolve => setTimeout(() => resolve(), 0))
    await wait(() => expect(wrapper.queryByText('1 name')).not.toBeNull())
    const textbox = wrapper.queryByText('1 name')
    expect(textbox).not.toBeNull()
  })
})
