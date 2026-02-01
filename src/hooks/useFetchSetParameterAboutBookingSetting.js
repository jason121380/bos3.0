import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_ABOUT_BOOKING_SETTING = gql`
  mutation SET_PARAMETER_ABOUT_BOOKING_SETTING($input: ParameterAboutBookingSettingInput!) {
    setParameterAboutBookingSetting(input: $input)
  }
`
export default function useFetchSetParameterAboutBookingSetting() {
  const [setParameterAboutBookingSetting] = useMutation(SET_PARAMETER_ABOUT_BOOKING_SETTING)
  return {
    setParameterAboutBookingSetting: ({ input }) =>
      setParameterAboutBookingSetting({
        variables: {
          input,
        },
      }),
  }
}
