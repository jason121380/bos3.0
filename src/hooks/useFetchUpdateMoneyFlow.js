import { gql, useMutation } from '@apollo/client'

const USE_FETCH_UPDATE_MONEY_FLOW = gql`
  mutation USE_FETCH_UPDATE_MONEY_FLOW($id: ID!, $input: MoneyFlowInput, $password: String) {
    updateMoneyFlow(id: $id, input: $input, password: $password) {
      id
    }
  }
`

export default function useFetchUpdateMoneyFlow() {
  const [updateMoneyFlow] = useMutation(USE_FETCH_UPDATE_MONEY_FLOW)
  return {
    updateMoneyFlow: ({ input, id, password }) =>
      updateMoneyFlow({
        variables: {
          input,
          id,
          password,
        },
      }),
  }
}
