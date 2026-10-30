import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_REPORT_SETTING = gql`
  mutation SET_PARAMETER_REPORT_SETTING($input: ParameterReportSettingInput!) {
    setParameterReportSetting(input: $input)
  }
`

export default function useFetchSetParameterReportSetting() {
  const [setParameterReportSetting] = useMutation(SET_PARAMETER_REPORT_SETTING)
  return {
    setParameterReportSetting: ({ input }) =>
      setParameterReportSetting({
        variables: {
          input,
        },
      }),
  }
}
