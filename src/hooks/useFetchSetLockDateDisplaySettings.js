import { gql, useMutation } from '@apollo/client'

const SET_LOCK_DATE_DISPLAY = gql`
  mutation SET_LOCK_DATE_DISPLAY($input: Boolean!) {
    setDateLockDisplay(input: $input)
  }
`

export default function useFetchSetLockDateDisplaySettings() {
  const [setLockDateDisplay] = useMutation(SET_LOCK_DATE_DISPLAY)
  return {
    setLockDateDisplay: ({ input }) =>
      setLockDateDisplay({
        variables: {
          input,
        },
      }),
  }
}
