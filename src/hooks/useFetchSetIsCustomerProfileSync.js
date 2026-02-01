import { gql, useMutation } from '@apollo/client'

const SET_IS_CUSTOMER_PROFILE_SYNC = gql`
  mutation SET_IS_CUSTOMER_PROFILE_SYNC($input: Boolean!) {
    setIsCustomerProfileSync(input: $input)
  }
`

export default function useFetchSetIsCustomerProfileSync() {
  const [setCustomerProfileSync] = useMutation(
    SET_IS_CUSTOMER_PROFILE_SYNC
  )
  return {
    setCustomerProfileSync: ({ input }) =>
      setCustomerProfileSync({
        variables: {
          input,
        },
      }),
  }
}