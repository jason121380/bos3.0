import { gql, useMutation } from '@apollo/client'

const SET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD = gql`
  mutation SET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD($input: Boolean!) {
    setMonthlyAverageDisplayForDesignerLeaderBoard(input: $input)
  }
`

export default function useFetchSetMonthlyAverageDisplayForDesignerLeaderBoard() {
  const [setMonthlyAverageDisplayForDesignerLeaderBoardSetting] = useMutation(
    SET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD
  )
  return {
    setMonthlyAverageDisplayForDesignerLeaderBoardSetting: ({ input }) =>
      setMonthlyAverageDisplayForDesignerLeaderBoardSetting({
        variables: {
          input,
        },
      }),
  }
}
