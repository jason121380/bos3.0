import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_ABOUT_CUSTOMER_SETTING = gql`
  mutation SET_PARAMETER_ABOUT_CUSTOMER_SETTING($input: ParameterAboutCustomerSettingInput!) {
    setParameterAboutCustomerSetting(input: $input)
  }
`
export default function useFetchSetParameterAboutCustomerSetting() {
  const [setParameterAboutCustomerSetting] = useMutation(SET_PARAMETER_ABOUT_CUSTOMER_SETTING)
  return {
    setParameterAboutCustomerSetting: ({ input }) =>
      setParameterAboutCustomerSetting({
        variables: {
          input,
        },
      }),
  }
}
