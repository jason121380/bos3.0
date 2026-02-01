import { gql, useQuery } from '@apollo/client'

const FETCH_EMPLOYEE_LIST = gql`
  query userList($input: UsersInput!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        uid
        name
        email
        gender
        avatar
        status
        address
        lastName
        nickName
        jobTitle
        merchants
        userGroup
        cellphone
        firstName
        designerNo
        groupCategory
        isNeedChangePassword
      }
    }
  }
`
export default function useFetchEmployeeList({ pageLimit = 5, pageOffset = 0, keyword = '' }) {
  return useQuery(FETCH_EMPLOYEE_LIST, {
    variables: {
      input: {
        pageLimit,
        pageOffset,
        keyword,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
