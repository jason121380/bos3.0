import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_DESIGNANTION_BOOKING_LIMIT = gql`
  mutation SET_MERCHANT_DESIGNANTION_BOOKING_LIMIT($count: Int!) {
    setMerchantDesignationBookingLimit(count: $count)
  }
`

export default function useFetchSetMerchantDesignationBookingLimit() {
  const [setMerchantDesignationBookingLimit] = useMutation(SET_MERCHANT_DESIGNANTION_BOOKING_LIMIT)
  return {
    setMerchantDesignationBookingLimit: ({ count }) =>
    setMerchantDesignationBookingLimit({
        variables: {
          count,
        },
      }),
  }
}
