import { gql, useMutation } from '@apollo/client'

const SET_COMMISSION = gql`
  mutation SETTING_COMMISSION_WAY($input: [SettingCommissionWayInput!]) {
    settingCommissionWay(input: $input)
  }
`

export default function useFetchSettingCommissionWay() {
  const [setCommission] = useMutation(SET_COMMISSION)
  return {
    setCommission: ({ input }) =>
      setCommission({
        variables: {
          input,
        },
      }),
  }
}
