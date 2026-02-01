import { gql, useMutation } from '@apollo/client'
const CREATE_MERCHANT_POINT_VALUE_SETTING = gql`
  mutation CREATE_MERCHANT_POINT_VALUE_SETTING($input: CreateMerchantPointValueSettingInput!) {
    createMerchantPointValueSetting(input: $input)
  }
`
export default function useFetchCreateMerchantPointValueSetting() {
  const [createMerchantPointValueSetting] = useMutation(CREATE_MERCHANT_POINT_VALUE_SETTING)
  return {
    createMerchantPointValueSetting: input =>
      createMerchantPointValueSetting({
        variables: {
          input,
        },
      }),
  }
}
