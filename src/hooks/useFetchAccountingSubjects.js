import { gql, useQuery } from '@apollo/client'

export const GET_ACCOUNTING_SUBJECTS = gql`
  query GET_ACCOUNTING_SUBJECTS {
    accountingSubjects {
      id
      number
      name
      inoutType
      isUsing
    }
  }
`

export default function useFetchAccountingSubjects() {
  return useQuery(GET_ACCOUNTING_SUBJECTS, {
    fetchPolicy: 'cache-and-network',
  })
}
