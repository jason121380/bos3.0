// import React from 'react';
// import AccountingRecordCreate from '../'

// import { render, act, cleanup } from '@testing-library/react'

// import CustomMockedProvider from 'test-utils/CustomMockedProvider'

// import { FETCH_USERS } from '../General'
// import { ACCOUNTING_SUBJECTS } from 'components/AccountingSubjectsAutocomplete'

// let mocks = []
// afterEach(() => {
//   cleanup()
//   mocks = []
// })

// jest.mock('@material-ui/styles', () => {
//   const styles = jest.requireActual('@material-ui/styles')
//   const mockMakeStyles = jest.fn(theme => ({
//     theme: {
//       spacing: jest.fn()
//     }
//   })).mockReturnValue(jest.fn().mockReturnValue({ root: 'xxsx'}))
//   return {
//     ...styles,
//     makeStyles: mockMakeStyles
//   }
// })

// jest.mock('react-router', () => {
//   const reactRouter = jest.requireActual('react-router')
//   return {
//     ...reactRouter,
//     useLocation: jest.fn().mockReturnValue({
//       pathname: ''
//     })
//   }
// })

// let wrapper

// it('should render success', async () => {
//   mocks = [
//     {
//       request: {
//         query: FETCH_USERS
//       },
//       result: {
//         data: {
//           users: {
//             users: [
//               {
//                 id: '1',
//                 name: 'name'
//               }
//             ]
//           }
//         }
//       }
//     }, {
//       request: {
//         query: ACCOUNTING_SUBJECTS
//       },
//       result: {
//         data: {
//           accountingSubjects: [
//             {
//               id: "1",
//               name: "營業收入",
//               number: 1,
//               inoutType: "REVENUE"
//             }
//           ]
//         }
//       }
//     }
//   ]
//     await act(async () => {
//       wrapper = await render(
//         <CustomMockedProvider mocks={mocks} addTypename={false}>
//           <AccountingRecordCreate />
//         </CustomMockedProvider>
//       )
//     })
// })

it('', () => {})
