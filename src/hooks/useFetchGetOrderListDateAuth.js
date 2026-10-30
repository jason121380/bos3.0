import { gql, useQuery } from '@apollo/client'

const GET_ORDER_LIST_DATE_AUTH = gql`
  query GET_ORDER_LIST_DATE_AUTH {
    orderListDateAuth {
      lastmonth
      thismonth
      dbyesterday
      yesterday
      today
      selector
    }
  }
`

export default function useFetchGetOrderListDateAuth() {
  return useQuery(GET_ORDER_LIST_DATE_AUTH, {
    fetchPolicy: 'cache-and-network',
  })
}
