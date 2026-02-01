import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_HAIR_CONDITION = gql`
  mutation SET_MERCHANT_HAIR_CONDITION($input: MerchantHairConditionInput!) {
    setMerchantHairCondition(input: $input)
  }
`

export default function useFetchSetMerchantHairCondition() {
  const [setMerchantHairCondition] = useMutation(SET_MERCHANT_HAIR_CONDITION)
  return {
    setMerchantHairCondition: ({ input }) =>
    setMerchantHairCondition({
        variables: {
          input,
        },
      }),
  }
}
