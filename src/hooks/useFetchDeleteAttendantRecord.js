import { gql, useMutation } from '@apollo/client'

export const DELETE_ATTENDANT_RECORD = gql`
  mutation deleteAttendantRecord($clockInScheduleUUId: ID!) {
    deleteAttendantRecord(clockInScheduleUUId: $clockInScheduleUUId)
  }
`

export default function useFetchDeleteAttendantRecord() {
  const [deleteAttendantRecord] = useMutation(DELETE_ATTENDANT_RECORD)

  return {
    deleteAttendantRecord: clockInScheduleUUId =>
    deleteAttendantRecord({
        variables: {
          clockInScheduleUUId,
        },
      }),
  }
}
