import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_ACCOUNTING_SUBJECTS = settingsQuery(gql`
  query GET_ACCOUNTING_SUBJECTS {
    accountingSubjects {
      id
      number
      name
      inoutType
      isUsing
    }
  }
`)

export default function useFetchAccountingSubjects() {
  return useQuery(GET_ACCOUNTING_SUBJECTS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
