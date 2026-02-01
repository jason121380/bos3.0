import { gql, useQuery } from '@apollo/client'

const GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT = gql`
  query GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT {
    getIsDisplayNonBankAccountInBankTransferReport
  }
`

export default function useFetchGetIsDisplayNonBankAccountInBankTransferReport() {
  return useQuery(GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}