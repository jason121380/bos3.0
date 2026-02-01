import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_BANK_SETTINGS = gql`
  query GET_MERCHANT_BANK_SETTINGS {
    getMerchantBankSettings {
      remitterName
      remitterBankName
      remitterBankAccount
      remitterBankBranchName
      remitterBankBranchCode
      trustorName
      trustorPhone
    }
  }
`

export default function useFetchMerchantBankSettings() {
  return useQuery(GET_MERCHANT_BANK_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  })
}
