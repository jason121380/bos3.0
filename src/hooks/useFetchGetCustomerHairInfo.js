import { gql, useQuery } from '@apollo/client'
const GET_CUSTOMER_HAIR_INFO = gql`
  query GET_CUSTOMER_HAIR_INFO($customerId: ID!) {
    getCustomerHairInfo(customerId: $customerId) {
      hairProperties
      scalpProperties
      permAppliance
      permPotion
      hairColorCategory
      hairColor
      hairDyeFormula
    }
  }
`

export default function useFetchGetCustomerHairInfo(customerId) {
  return useQuery(GET_CUSTOMER_HAIR_INFO, {
    variables: {
      customerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
