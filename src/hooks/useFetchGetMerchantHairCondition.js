import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_MERCHANT_HAIR_CONDITION = gql`
  query GET_MERCHANT_HAIR_CONDITION {
    getMerchantHairCondition {
      hairProperties
      scalpProperties
      permAppliance
      permPotion
      hairColorCategory
      hairColor
    }
  }
`

export default function useFetchGetMerchantHairCondition() {
  return useQuery(GET_MERCHANT_HAIR_CONDITION, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetMerchantHairConditionLazy() {
  const [getMerchantHairCondition, merchantHairConditionData] = useLazyQuery(GET_MERCHANT_HAIR_CONDITION, {
    fetchPolicy: 'cache-and-network',
  })
  return [getMerchantHairCondition, merchantHairConditionData]
}