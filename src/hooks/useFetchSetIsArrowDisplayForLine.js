import { gql, useMutation } from '@apollo/client'

const SET_IS_ARROW_DISPLAY_PROFILE_SYNC = gql`
  mutation SET_IS_ARROW_DISPLAY_PROFILE_SYNC($input: Boolean!) {
    setIsArrowDisplayForLine(input: $input)
  }
`

export default function useFetchSetIsArrowDisplayForLine() {
  const [setIsArrowDisplayForLine] = useMutation(
    SET_IS_ARROW_DISPLAY_PROFILE_SYNC
  )
  return {
    setIsArrowDisplayForLine: ({ input }) =>
      setIsArrowDisplayForLine({
        variables: {
          input,
        },
      }),
  }
}