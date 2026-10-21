// get商品列表成本是否顯示

import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PRODUCT_COST_IS_DISPLAY = settingsQuery(gql`
  query GET_PRODUCT_COST_IS_DISPLAY {
    getIsProductCostDisplay
  }
`)

export default function useFetchGetProductCostIsDisplayInProductReport() {
  return useQuery(GET_PRODUCT_COST_IS_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
