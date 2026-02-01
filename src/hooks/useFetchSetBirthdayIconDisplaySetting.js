import { gql, useMutation } from '@apollo/client'

const SET_BIRTHDAY_ICOB_DISPLAY_SETTING = gql`
  mutation SET_BIRTHDAY_ICOB_DISPLAY_SETTING($input: Boolean!) {
    setBirthdayIconDisplaySetting(input: $input)
  }
`

export default function useFetchSetBirthdayIconDisplaySetting() {
  const [setBirthdayIconDisplay] = useMutation(SET_BIRTHDAY_ICOB_DISPLAY_SETTING)
  return {
    setBirthdayIconDisplay: ({ input }) =>
      setBirthdayIconDisplay({
        variables: {
          input,
        },
      }),
  }
}