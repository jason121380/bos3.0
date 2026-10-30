import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_HAIR_CONDITION = settingsQuery(gql`
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
`)

export default function useFetchGetMerchantHairCondition() {
  return useQuery(GET_MERCHANT_HAIR_CONDITION, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetMerchantHairConditionLazy() {
  const [getMerchantHairCondition, merchantHairConditionData] = useLazyQuery(GET_MERCHANT_HAIR_CONDITION, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [getMerchantHairCondition, merchantHairConditionData]
}
