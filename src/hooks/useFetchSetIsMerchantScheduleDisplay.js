import { gql, useMutation } from '@apollo/client'

const SET_IS_MERCHANT_SCHEDULE_DISPLAY = gql`
  mutation SET_IS_MERCHANT_SCHEDULE_DISPLAY($input: Boolean!) {
    setIsMerchantScheduleDisplay(input: $input)
  }
`

export default function useFetchSetIsMerchantScheduleDisplay() {
  const [setIsMerchantScheduleDisplaySetting] = useMutation(SET_IS_MERCHANT_SCHEDULE_DISPLAY)
  return {
    setIsMerchantScheduleDisplaySetting: ({ input }) =>
    setIsMerchantScheduleDisplaySetting({
        variables: {
          input,
        },
      }),
  }
}
