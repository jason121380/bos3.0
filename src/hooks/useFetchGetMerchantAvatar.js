import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_AVATAR = gql`
  query GET_MERCHANT_AVATAR($input: ID!) {
    getMerchantAvatar(input: $input)
  }
`

export default function useFetchGetMerchantAvatar({ input }) {
  return useQuery(GET_MERCHANT_AVATAR, {
    variables: {
      input
    },
    fetchPolicy: 'cache-and-network',
  })
}