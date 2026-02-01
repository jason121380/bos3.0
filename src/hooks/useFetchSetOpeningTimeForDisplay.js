import { gql, useMutation } from '@apollo/client'

const SET_OPENING_TIME_FOR_DISPLAY = gql`
  mutation SET_OPENING_TIME_FOR_DISPLAY($input: OpeningTimeForDisplaySettingInput!) {
    setOpeningTimeForDisplay(input: $input)
  }
`

export default function useFetchSetOpeningTimeForDisplay() {
  const [setOpeningTimeForDisplay] = useMutation(SET_OPENING_TIME_FOR_DISPLAY)
  return {
    setOpeningTimeForDisplay: ({ input }) =>
      setOpeningTimeForDisplay({
        variables: {
          input,
        },
      }),
  }
}