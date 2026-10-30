import { gql, useMutation } from '@apollo/client'

const USE_FETCH_DELETE_MONEY_FLOW = gql`
  mutation USE_FETCH_DELETE_MONEY_FLOW($id: ID!) {
    deleteMoneyFlow(id: $id) {
      id
    }
  }
`

export default function useFetchDeleteMoneyFlow() {
  const [deleteMoneyFlow] = useMutation(USE_FETCH_DELETE_MONEY_FLOW)
  return {
    deleteMoneyFlow: id =>
      deleteMoneyFlow({
        variables: {
          id,
        },
      }),
  }
}
