import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_NAME = gql`
  query GET_MERCHANT_NAME($input: ID!) {
    getMerchantName(input: $input)
  }
`

export default function useFetchGetMerchantName({ input }) {
  return useQuery(GET_MERCHANT_NAME, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
