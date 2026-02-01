import { gql, useMutation } from '@apollo/client'

const SET_IS_AUTO_CLEAR_ADDED_TIME_IN_SCHEDULE_TABLE = gql`
  mutation SET_IS_AUTO_CLEAR_ADDED_TIME_IN_SCHEDULE_TABLE($input: Boolean!) {
    setIsAutoClearAddedTimeInScheduleTable(input: $input)
  }
`

export default function useFetchSetIsAutoClearAddedTimeInScheduleTable() {
  const [setIsAutoClearAddedTimeInScheduleTable] = useMutation(SET_IS_AUTO_CLEAR_ADDED_TIME_IN_SCHEDULE_TABLE)
  return {
    setIsAutoClearAddedTimeInScheduleTable: ({ input }) =>
      setIsAutoClearAddedTimeInScheduleTable({
        variables: {
          input,
        },
      }),
  }
}