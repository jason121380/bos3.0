import { gql, useMutation } from '@apollo/client'

const SET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER = gql`
  mutation SET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER($input: Boolean!) {
    setIsDailyCheckoutBlockedByDraftOrder(input: $input)
  }
`

export default function useFetchSetIsDailyCheckoutBlockedByDraftOrder() {
  const [setIsDailyCheckoutBlockedByDraftOrderSetting] = useMutation(
    SET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER
  )
  return {
    setIsDailyCheckoutBlockedByDraftOrderSetting: ({ input }) =>
      setIsDailyCheckoutBlockedByDraftOrderSetting({
        variables: {
          input,
        },
      }),
  }
}