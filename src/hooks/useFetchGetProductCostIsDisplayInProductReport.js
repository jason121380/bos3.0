// get商品列表成本是否顯示

import { gql, useQuery } from '@apollo/client'

const GET_PRODUCT_COST_IS_DISPLAY = gql`
  query GET_PRODUCT_COST_IS_DISPLAY {
    getIsProductCostDisplay
  }
`

export default function useFetchGetProductCostIsDisplayInProductReport() {
  return useQuery(GET_PRODUCT_COST_IS_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
