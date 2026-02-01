import { gql, useMutation } from '@apollo/client'

const SET_DESIGNATION_SETTING_FOR_ORDER_CREATE = gql`
  mutation SET_DESIGNATION_SETTING_FOR_ORDER_CREATE($input: DesignationSettingEnum!) {
    setDesignationSettingForOrderCreate(input: $input)
  }
`

export default function useFetchSetDesignationSettingForOrderCreate() {
  const [setDesignationSettingForOrderCreateSetting] = useMutation(
    SET_DESIGNATION_SETTING_FOR_ORDER_CREATE
  )
  return {
    setDesignationSettingForOrderCreateSetting: ({ input }) =>
      setDesignationSettingForOrderCreateSetting({
        variables: {
          input,
        },
      }),
  }
}
