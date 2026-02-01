import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_BOOK_AUTO_ACCEPT = gql`
  mutation SET_MERCHANT_BOOK_AUTO_ACCEPT($input: Boolean!) {
    setMerchantBookingAutoAcceptSetting(input: $input)
  }
`

export default function useFetchSettingMerchantBookingAutoAcceptSetting() {
  const [setMerchantBookingAuto] = useMutation(SET_MERCHANT_BOOK_AUTO_ACCEPT)
  return {
    setMerchantBookingAuto: ({ input }) =>
      setMerchantBookingAuto({
        variables: {
          input,
        },
      }),
  }
}
