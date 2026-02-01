import { gql, useMutation } from '@apollo/client'

const SET_TEACHING_MODE_DISPLAY = gql`
  mutation SET_TEACHING_MODE_DISPLAY($input: Boolean!) {
    setMerchantTeachingModeSettings(input: $input)
  }
`

export default function useFetchSetMerchantTeachingModeSettings() {
  const [setMerchantTeachingModeSettings] = useMutation(SET_TEACHING_MODE_DISPLAY)
  return {
    setMerchantTeachingModeSettings: ({ input }) =>
      setMerchantTeachingModeSettings({
        variables: {
          input,
        },
      }),
  }
}
