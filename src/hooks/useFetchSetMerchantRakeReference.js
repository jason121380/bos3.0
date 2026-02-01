import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_RAKE_REFERENCE = gql`
  mutation SET_MERCHANT_RAKE_REFERENCE($input: SetMerchantRakeReferenceInput!) {
    setMerchantRakeReference(input: $input)
  }
`

export default function useFetchSetMerchantRakeReference() {
  const [setRakeReference] = useMutation(SET_MERCHANT_RAKE_REFERENCE)
  return {
    setRakeReference: ({ input }) =>
      setRakeReference({
        variables: {
          input,
        },
      }),
  }
}