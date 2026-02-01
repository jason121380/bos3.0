import { gql, useMutation } from '@apollo/client'

const SET_ACCOUNTING_REVENUE_SUBJECTS = gql`
  mutation SET_ACCOUNTING_REVENUE_SUBJECTS($input: [SetAccountingSubjectsInput]!) {
    setAccountingRevenueSubjects(input: $input)
  }
`

export default function useFetchSettingAccountingRevenue() {
  const [setAccountingRevenue] = useMutation(SET_ACCOUNTING_REVENUE_SUBJECTS)
  return {
    setAccountingRevenue: ({ input }) =>
      setAccountingRevenue({
        variables: {
          input,
        },
      }),
  }
}
