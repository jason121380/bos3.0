import { gql, useMutation } from '@apollo/client'
const DELETE_MERCHANT_POINT_VALUE_SETTING = gql`
  mutation DELETE_MERCHANT_POINT_VALUE_SETTING($input: [ID]!) {
    deleteMerchantPointValueSetting(input: $input)
  }
`
export default function useFetchDeleteMerchantPointValueSetting() {
  const [deleteMerchantPointValueSetting] = useMutation(DELETE_MERCHANT_POINT_VALUE_SETTING)
  return {
    deleteMerchantPointValueSetting: input =>
      deleteMerchantPointValueSetting({
        variables: {
          input,
        },
      }),
  }
}
