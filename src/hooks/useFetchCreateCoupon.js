import { gql, useMutation } from '@apollo/client'

const CREATE_COUPON = gql`
  mutation CREATE_COUPON($input: CreateServiceInput!) {
    createService(input: $input)
  }
`

export default function useFetchCreateCoupon() {
  const [createCoupon] = useMutation(CREATE_COUPON)
  return {
    createCoupon: ({ input }) =>
      createCoupon({
        variables: {
          input,
        },
      }),
  }
}
