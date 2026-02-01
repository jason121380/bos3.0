import { gql, useQuery } from '@apollo/client'

export const GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT = gql`
  query GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT {
    getIsUsingMathRoundInDesignerDailyReport
  }
`

export default function useFetchGetIsUsingMathRoundInDesignerDailyReport() {
  return useQuery(GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}
