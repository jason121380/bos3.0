import { gql, useQuery } from '@apollo/client'

const GET_IS_BORROW_IN_SALARY_OVERVIEW = gql`
  query GET_IS_BORROW_IN_SALARY_OVERVIEW {
    getIsBorrowDisplayInSalaryOverview
  }
`

export default function useFetchGetIsBorrowDisplayInSalaryOverview() {
  return useQuery(GET_IS_BORROW_IN_SALARY_OVERVIEW, {
    fetchPolicy: 'cache-and-network',
  })
}
