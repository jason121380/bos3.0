import { gql, useQuery } from '@apollo/client'

const GET_USER_SALARY_ITEM = gql`
  query GET_USER_SALARY_ITEM($input: UserSalaryItemRecordInput!) {
    userSalaryItemRecord(input: $input) {
      userId
      increaseItem {
        itemName
        price
        type
      }
      decreaseItem {
        itemName
        price
        type
      }
    }
  }
`

export default function useFetchUserSalaryItem(input) {
  return useQuery(GET_USER_SALARY_ITEM, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
