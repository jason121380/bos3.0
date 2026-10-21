import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD = settingsQuery(gql`
  query GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD {
    getMonthlyAverageDisplayForDesignerLeaderBoard
  }
`)

export default function useFetchMonthlyAverageDisplayForDesignerLeaderBoard() {
  return useQuery(GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
