import { gql, useMutation } from '@apollo/client'

const SET_ORDER_RANKING = gql`
  mutation SET_ORDER_RANKING($input: SetOrderRankingInput!) {
    setOrderRanking(input: $input) {
      designerName
      avatar
      rank
      comment
      isCommented
    }
  }
`

export default function useFetchSetOrderRanking() {
  const [setOrderRanking] = useMutation(SET_ORDER_RANKING)
  return {
    setOrderRanking: ({ input }) =>
      setOrderRanking({
        variables: {
          input,
        },
      }),
  }
}