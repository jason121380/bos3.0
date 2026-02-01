import { gql, useMutation } from '@apollo/client'

const SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT = gql`
  mutation SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT($input: Boolean!) {
    setIsDisplayNonBankAccountInBankTransferReport(input: $input)
  }
`

export default function useFetchSetIsDisplayNonBankAccountInBankTransferReport() {
  const [setIsDisplayNonBankAccountInBankTransferReport] = useMutation(SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT)
  return {
    setIsDisplayNonBankAccountInBankTransferReport: ({ input }) =>
    setIsDisplayNonBankAccountInBankTransferReport({
        variables: {
          input,
        },
      }),
  }
}
