import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_BANK_SETTINGS = settingsQuery(gql`
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
`)

export default function useFetchMerchantBankSettings() {
  return useQuery(GET_MERCHANT_BANK_SETTINGS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
