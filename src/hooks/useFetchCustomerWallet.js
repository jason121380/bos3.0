import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_CUSTOMER_WALLET = gql`
  query customerWallet($customerId: ID) {
    customerWallet(customerId: $customerId)
  }
`

export default function useFetchCustomerWallet({ customerId }) {
  return useQuery(FETCH_CUSTOMER_WALLET, {
    variables: {
      customerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useLazyFetchCustomerWallet = ({ customerId }) => {
  const [fetchCustomerWallet, response] = useLazyQuery(FETCH_CUSTOMER_WALLET, {
    variables: {
      customerId,
    },
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchCustomerWallet,
    response,
  }
}
