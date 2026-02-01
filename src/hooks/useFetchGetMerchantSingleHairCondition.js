import { gql, useLazyQuery } from '@apollo/client'

const GET_MERCHANT_SINGLE_HAIR_CONDITION = gql`
  query GET_MERCHANT_SINGLE_HAIR_CONDITION($input: HairConditionEnum!) {
    getMerchantSingleHairCondition(input: $input) 
  }
`

export default function useFetchGetMerchantSingleHairCondition() {
  const [getSingleCondition, singleConditionData] = useLazyQuery(GET_MERCHANT_SINGLE_HAIR_CONDITION, {
    fetchPolicy: 'cache-and-network',
  })
  return [getSingleCondition, singleConditionData]
}