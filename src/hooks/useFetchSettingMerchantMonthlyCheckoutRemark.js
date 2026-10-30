import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_MONTHLY_CHECKOUT_REMARK = gql`
  mutation SET_MERCHANT_MONTHLY_CHECKOUT_REMARK($date: DateTime!, $remark: String) {
    setMerchantMonthlyCheckoutRemark(date: $date, remark: $remark)
  }
`

export default function useFetchSettingMerchantMonthlyCheckoutRemark() {
  const [setMerchantMerchantMonthlyCheckoutRemark] = useMutation(SET_MERCHANT_MONTHLY_CHECKOUT_REMARK)
  return {
    setMerchantMerchantMonthlyCheckoutRemark: ({ date, remark }) =>
      setMerchantMerchantMonthlyCheckoutRemark({
        variables: {
          date,
          remark,
        },
      }),
  }
}
