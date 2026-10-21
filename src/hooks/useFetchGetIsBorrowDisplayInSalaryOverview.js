import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_BORROW_IN_SALARY_OVERVIEW = settingsQuery(gql`
  query GET_IS_BORROW_IN_SALARY_OVERVIEW {
    getIsBorrowDisplayInSalaryOverview
  }
`)

export default function useFetchGetIsBorrowDisplayInSalaryOverview() {
  return useQuery(GET_IS_BORROW_IN_SALARY_OVERVIEW, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
