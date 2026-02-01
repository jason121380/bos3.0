import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_REVERVATION_TIME = gql`
  mutation SET_MERCHANT_REVERVATION_TIME($input: [MerchantReservationTimeInput]!) {
    setMerchantReservationTime(input: $input)
  }
`

export default function useFetchSetMerchantReservationTime() {
  const [setMerchantReservationTime] = useMutation(SET_MERCHANT_REVERVATION_TIME)
  return {
    setMerchantReservationTime: ({ input }) =>
      setMerchantReservationTime({
        variables: {
          input,
        },
      }),
  }
}