import { MockLink, MockedProvider } from '@apollo/client/testing'
import { ApolloLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Provide a way to inspect which queries are made to the MockLink
class MyMockLink extends MockLink {
  request(operation) {
    return super.request(operation)
  }
}

export default function CustomMockedProvider({ mocks = [], ...otherProps }) {
  // Log the error "no more mocked responses for the query" by default

  const errorLoggingLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      )

    if (networkError) console.log(`[Network error]: ${networkError}`)
  })

  const mockLink = new MyMockLink(mocks)

  const link = ApolloLink.from([errorLoggingLink, mockLink])

  return (
    <MemoryRouter initialEntries={['/apage']}>
      <MockedProvider {...otherProps} link={link} addTypename={false} />
    </MemoryRouter>
  )
}

// 檔名帶 .test 是因為 CRA 把 __tests__ 下每個檔都當測試（同 testkit.test.js）；被 import 時只提供元件
describe('CustomMockedProvider（測試工具）', () => {
  it('以 MemoryRouter 與 MockedProvider 包住子元素', async () => {
    render(
      <CustomMockedProvider mocks={[]}>
        <p>子內容</p>
      </CustomMockedProvider>
    )
    expect(await screen.findByText('子內容')).toBeInTheDocument()
  })
})
