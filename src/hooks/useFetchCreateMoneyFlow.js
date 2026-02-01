import { gql, useMutation } from '@apollo/client'
const CREATE_MONEY_FLOW = gql`
  mutation CREATE_MONEY_FLOW($input: MoneyFlowInput!) {
    createMoneyFlow(input: $input) {
      id
    }
}
`
export default function useFetchCreateMoneyFlow() {
  const [createMoneyFlow] = useMutation(CREATE_MONEY_FLOW)
  return {
    createMoneyFlow: input =>
      createMoneyFlow({
        variables: {
          input,
        },
      }),
  }
}
