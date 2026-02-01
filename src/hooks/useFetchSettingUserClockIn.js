import { gql, useMutation } from '@apollo/client'

const SET_USER_CLOCK_IN = gql`
  mutation SET_USER_CLOCK_IN($input: UserClockInInput!) {
    userClockIn(input: $input) {
      status
      message
    }
  }
`

export default function useFetchSetUserClockIn() {
  const [setUserClockIn] = useMutation(SET_USER_CLOCK_IN)
  return {
    setUserClockIn: ({ input }) =>
      setUserClockIn({
        variables: {
          input,
        },
      }),
  }
}
