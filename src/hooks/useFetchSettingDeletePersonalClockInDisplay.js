import { gql, useMutation } from '@apollo/client'

const SET_DELETE_PERSONAL_CLOCKIN_DISPLAY = gql`
  mutation SET_DELETE_PERSONAL_CLOCKIN_DISPLAY($input: Boolean!) {
    setDeletePersonalClockInDisplay(input: $input)
  }
`

export default function useFetchDetDeletePersonalClockInDisplay() {
  const [setDeletePersonalClockInDisplaySetting] = useMutation(SET_DELETE_PERSONAL_CLOCKIN_DISPLAY)
  return {
    setDeletePersonalClockInDisplaySetting: ({ input }) =>
      setDeletePersonalClockInDisplaySetting({
        variables: {
          input,
        },
      }),
  }
}
