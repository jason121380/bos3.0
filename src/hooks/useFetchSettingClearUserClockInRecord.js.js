import { gql, useMutation } from '@apollo/client'

const SET_CLEAR_CLOCK_IN_RECORD = gql`
  mutation SET_CLEAR_CLOCK_IN_RECORD($userIds: [ID]!, $date: DateTime!) {
    clearUserClockInRecord(userIds: $userIds, date: $date)
  }
`

export default function useFetchSettingClearClockInRecord() {
  const [setClearClockInRecord] = useMutation(SET_CLEAR_CLOCK_IN_RECORD)
  return {
    setClearClockInRecord: ({ userIds, date }) =>
      setClearClockInRecord({
        variables: {
          userIds,
          date,
        },
      }),
  }
}
