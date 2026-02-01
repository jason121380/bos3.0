import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_SMS_ACCOUNT = gql`
  query GET_MERCHANT_SMS_ACCOUNT {
    getMerchantSMSAccount {
      account
      password
    }
  }
`

export default function useFetchGetMerchantSMSAccount() {
  return useQuery(GET_MERCHANT_SMS_ACCOUNT, {
    fetchPolicy: 'cache-and-network',
  })
}