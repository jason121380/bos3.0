import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_MONTHLY_CHECKOUT_REMARK = gql`
  query GET_MERCHANT_MONTHLY_CHECKOUT_REMARK($date: DateTime!) {
    merchantMonthlyCheckoutRemark(date: $date)
  }
`

export default function useFetchMerchantMonthlyCheckoutRemark({ date }) {
  return useQuery(GET_MERCHANT_MONTHLY_CHECKOUT_REMARK, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
