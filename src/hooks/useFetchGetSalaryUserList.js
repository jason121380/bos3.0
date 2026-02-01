import { gql, useQuery } from '@apollo/client'

const GET_SALARY_USER_LIST = gql`
  query GET_SALARY_USER_LIST($input: SalaryUserListEnum, $date: DateTime!) {
    getSalaryUserList(input: $input, date: $date) {
      id
      name
      designerNo
      isOnDuty
      increaseItem(date: $date)
      increaseItemDetail(date: $date) {
        itemName
        price
        type
      }
      decreaseItem(date: $date)
      decreaseItemDetail(date: $date) {
        itemName
        price
        type
      }
      isSalaryChecked(date: $date)
    }
  }
`

export default function useFetchGetSalaryUserList({ input, date }) {
  return useQuery(GET_SALARY_USER_LIST, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
