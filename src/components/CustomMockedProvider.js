import { MockLink, MockedProvider } from '@apollo/client/testing'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import React from 'react'
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
