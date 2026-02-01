import { gql, useQuery } from '@apollo/client'

const GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD = gql`
  query GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD {
    getMonthlyAverageDisplayForDesignerLeaderBoard
  }
`

export default function useFetchMonthlyAverageDisplayForDesignerLeaderBoard() {
  return useQuery(GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD, {
    fetchPolicy: 'cache-and-network',
  })
}
