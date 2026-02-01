import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_ABOUT_SETTING_FUNCTION = gql`
  mutation SET_PARAMETER_ABOUT_SETTING_FUNCTION($input: ParameterAboutSettingFunctionInput!) {
    setParameterAboutSettingFunction(input: $input)
  }
`

export default function useFetchSetParameterAboutSettingFunction() {
  const [setParameterAboutSetting] = useMutation(SET_PARAMETER_ABOUT_SETTING_FUNCTION)
  return {
    setParameterAboutSetting: ({ input }) =>
      setParameterAboutSetting({
        variables: {
          input,
        },
      }),
  }
}