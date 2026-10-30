import { gql, useMutation } from '@apollo/client'

const SET_ORDER_RANKING_AND_COMMENT = gql`
  mutation SET_ORDER_RANKING_AND_COMMENT($input: SetOrderRankingAndCommentInput!) {
    setOrderRankingAndComment(input: $input)
  }
`

export default function useFetchSetOrderRankingAndComment() {
  const [setOrderRankingAndComment] = useMutation(SET_ORDER_RANKING_AND_COMMENT)
  return {
    setOrderRankingAndComment: ({ input }) =>
      setOrderRankingAndComment({
        variables: {
          input,
        },
      }),
  }
}
