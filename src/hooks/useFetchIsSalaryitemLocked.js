import { gql, useQuery } from '@apollo/client'

const FETCH_SALARY_ITEM_LOCK = gql`
  query FETCH_SALARY_ITEM_LOCK($date: DateTime) {
    isSalaryitemLocked(date: $date)
  }
`
export default function useFetchSalaryItemLock({ date }) {
  return useQuery(FETCH_SALARY_ITEM_LOCK, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
