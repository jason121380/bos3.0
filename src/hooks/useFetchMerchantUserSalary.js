import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_USER_SALARY = gql`
  query GET_MERCHANT_USER_SALARY($date: DateTime!) {
    getMerchantUserSalary(date: $date) {
      increase
      decrease
    }
  }
`

export default function useFetchMerchantUserSalary({ date }) {
  return useQuery(GET_MERCHANT_USER_SALARY, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
