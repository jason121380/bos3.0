import { gql, useMutation } from '@apollo/client'

const SET_UPDATE_USER_ORDERABLE_LIST = gql`
  mutation SET_UPDATE_USER_ORDERABLE_LIST {
    updateUserOrderableList
  }
`

export default function useFetchUpdateUserOrderableList() {
  const [setUpdateUserOrderableList] = useMutation(SET_UPDATE_USER_ORDERABLE_LIST)
  return {
    setUpdateUserOrderableList: () => setUpdateUserOrderableList(),
  }
}
