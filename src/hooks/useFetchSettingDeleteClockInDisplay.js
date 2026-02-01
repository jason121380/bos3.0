import { gql, useMutation } from '@apollo/client'

const SET_DELETE_ALL_CLOCKIN_DISPLAY = gql`
  mutation SET_DELETE_ALL_CLOCKIN_DISPLAY($input: Boolean!) {
    setDeleteClockInDisplay(input: $input)
  }
`

export default function useFetchSetDeleteClockInDisplay() {
  const [setDeleteAllClockInDisplaySetting] = useMutation(SET_DELETE_ALL_CLOCKIN_DISPLAY)
  return {
    setDeleteAllClockInDisplaySetting: ({ input }) =>
      setDeleteAllClockInDisplaySetting({
        variables: {
          input,
        },
      }),
  }
}
