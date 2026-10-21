import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT = settingsQuery(gql`
  query GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT {
    getIsDisplayNonBankAccountInBankTransferReport
  }
`)

export default function useFetchGetIsDisplayNonBankAccountInBankTransferReport() {
  return useQuery(GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}