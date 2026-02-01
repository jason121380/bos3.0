import { gql, useQuery } from '@apollo/client'

const GET_ACCOUNTING_SUBJECTS = gql`
  query GET_ACCOUNTING_SUBJECTS {
    accountingSubjects {
      id
      name
      isUsing
    }
  }
`

export default function useFetchGetAccountingSubjects() {
  return useQuery(GET_ACCOUNTING_SUBJECTS, {
    fetchPolicy: 'cache-and-network',
  })
}
