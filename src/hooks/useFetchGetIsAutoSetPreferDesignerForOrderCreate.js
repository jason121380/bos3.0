import { gql, useQuery } from '@apollo/client'

const GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE = gql`
  query GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE {
    getIsAutoSetPreferDesignerForOrderCreate
  }
`

export default function useFetchGetIsAutoSetPreferDesignerForOrderCreate() {
  return useQuery(GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE, {
    fetchPolicy: 'cache-and-network',
  })
}