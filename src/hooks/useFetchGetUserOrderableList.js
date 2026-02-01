import { gql, useQuery } from '@apollo/client'

const GET_USERS_ORDERABLE_LIST = gql`
  query GET_USERS_ORDERABLE_LIST {
    getUserOrderableList {
      userId
      userName
      userNickName
      userNo
    }
  }
`

export default function useFetchUsersOrderableList() {
  return useQuery(GET_USERS_ORDERABLE_LIST, {
    fetchPolicy: 'cache-and-network',
  })
}
