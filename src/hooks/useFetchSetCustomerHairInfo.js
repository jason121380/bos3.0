import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_HAIR_INFO = gql`
  mutation SET_CUSTOMER_HAIR_INFO($input: CustomerHairInfoInput!) {
    setCustomerHairInfo(input: $input)
  }
`

export default function useFetchSetCustomerHairInfo() {
  const [setCustomerHairInfo] = useMutation(SET_CUSTOMER_HAIR_INFO)
  return {
    setCustomerHairInfo: ({ input }) =>
      setCustomerHairInfo({
        variables: {
          input,
        },
      }),
  }
}