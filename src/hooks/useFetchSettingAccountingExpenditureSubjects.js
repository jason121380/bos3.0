import { gql, useMutation } from '@apollo/client'

const SET_ACCOUNTING_EXPENDITURE_SUBJECTS = gql`
  mutation SET_ACCOUNTING_EXPENDITURE_SUBJECTS($input: [SetAccountingSubjectsInput]!) {
    setAccountingExpenditureSubjects(input: $input)
  }
`

export default function useFetchSettingAccountingExpenditure() {
  const [setAccountingExpenditure] = useMutation(SET_ACCOUNTING_EXPENDITURE_SUBJECTS)
  return {
    setAccountingExpenditure: ({ input }) =>
      setAccountingExpenditure({
        variables: {
          input,
        },
      }),
  }
}
