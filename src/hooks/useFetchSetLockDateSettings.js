import { gql, useMutation } from '@apollo/client'

const SET_LOCK_DATE = gql`
  mutation SET_LOCK_DATE($input: Boolean!) {
    setDateLock(input: $input)
  }
`

export default function useFetchSetLockDateSettings() {
  const [setLockDate] = useMutation(SET_LOCK_DATE)
  return {
    setLockDate: ({ input }) =>
      setLockDate({
        variables: {
          input,
        },
      }),
  }
}
