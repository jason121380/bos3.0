import { gql, useQuery } from '@apollo/client'

const GET_DESIGNER_NAME_FOR_CUSTOMER_SIDE = gql`
  query getDesignerNameForCustomerSide {
    getDesignerNameForCustomerSide
  }
`

export default function useFetchGetDesignerNameForCustomerSide() {
  return useQuery(GET_DESIGNER_NAME_FOR_CUSTOMER_SIDE, {
    fetchPolicy: 'cache-and-network',
  })
}
