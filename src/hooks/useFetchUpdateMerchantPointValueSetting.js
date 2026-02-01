import { gql, useMutation } from '@apollo/client'
const UPDATE_MERCHANT_POINT_VALUE_SETTING = gql`
  mutation UPDATE_MERCHANT_POINT_VALUE_SETTING($input: UpdateMerchantPointValueSettingInput!) {
    updateMerchantPointValueSetting(input: $input)
  }
`
export default function useFetchUpdateMerchantPointValueSetting() {
  const [updateMerchantPointValueSetting] = useMutation(UPDATE_MERCHANT_POINT_VALUE_SETTING)
  return {
    updateMerchantPointValueSetting: input =>
      updateMerchantPointValueSetting({
        variables: {
          input,
        },
      }),
  }
}
