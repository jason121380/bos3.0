import { gql, useMutation } from '@apollo/client'

const SET_USER_DEDUCTION_WAY = gql`
  mutation SET_USER_DEDUCTION_WAY($input: SetUserDeductionWayInput!) {
    setUserDeductionWay(input: $input)
  }
`

export default function useFetchSetUserDeductionWay() {
  const [setUserDeductionWay] = useMutation(SET_USER_DEDUCTION_WAY)
  return {
    setUserDeductionWay: ({ input }) =>
      setUserDeductionWay({
        variables: {
          input,
        },
      }),
  }
}
