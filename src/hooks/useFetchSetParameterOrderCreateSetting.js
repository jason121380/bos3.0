import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_ORDER_CREATE_SETTING = gql`
  mutation SET_PARAMETER_ORDER_CREATE_SETTING($input: ParameterOrderCreateSettingInput!) {
    setParameterOrderCreateSetting(input: $input)
  }
`

export default function useFetchSetParameterOrderCreateSetting() {
  const [setParameterOrderCreateSetting] = useMutation(SET_PARAMETER_ORDER_CREATE_SETTING)
  return {
    setParameterOrderCreateSetting: ({ input }) =>
      setParameterOrderCreateSetting({
        variables: {
          input,
        },
      }),
  }
}