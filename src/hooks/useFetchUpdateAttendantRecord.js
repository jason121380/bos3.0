import { gql, useMutation } from '@apollo/client'

const UPDATA_ATTENDANT_RECORD = gql`
  mutation UPDATA_ATTENDANT_RECORD($input: UpdateAttendantRecordInput!) {
    updateAttendantRecord(input: $input)
  }
`

export default function useFetchUpdateAttendantRecord() {
  const [updateAttendantRecord] = useMutation(UPDATA_ATTENDANT_RECORD)
  return {
    updateAttendantRecord: ({ input }) =>
      updateAttendantRecord({
        variables: {
          input,
        },
      }),
  }
}
