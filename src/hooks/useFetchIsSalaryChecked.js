import { gql, useQuery } from '@apollo/client'

const FETCH_IS_SALARY_CHECKED = gql`
  query FETCH_IS_SALARY_CHECKED($date: DateTime) {
    isSalaryChacked(date: $date)
  }
`
export default function useFetchIsSalaryChecked({ date }) {
  return useQuery(FETCH_IS_SALARY_CHECKED, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
