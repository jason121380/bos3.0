import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT = gql`
  mutation SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT(
    $input: SetMerchantDesignateTimeNonDesignateBookingLimitInput!
  ) {
    setMerchantDesignateTimeNonDesignateBookingLimit(input: $input) {
      merchant
      date
      limit
    }
  }
`

export default function useFetchSettingMerchantNonDesignateBookingLimit() {
  const [setMerchantNonDesignateBookingLimit] = useMutation(SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT)
  return {
    setMerchantNonDesignateBookingLimit: ({ input }) =>
      setMerchantNonDesignateBookingLimit({
        variables: {
          input,
        },
      }),
  }
}
