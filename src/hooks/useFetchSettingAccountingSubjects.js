import { gql, useMutation } from '@apollo/client'

const SET_ACCOUNTING_SUBJECTS = gql`
  mutation SET_ACCOUNTING_SUBJECTS($input: SetAccountingSubjectsInput!) {
    setAccountingSubjects(input: $input)
  }
`

export default function useFetchSettingAccountingSubjects() {
  const [setAccountSubjects] = useMutation(SET_ACCOUNTING_SUBJECTS)
  return {
    setAccountSubjects: ({ input }) =>
      setAccountSubjects({
        variables: {
          input,
        },
      }),
  }
}
