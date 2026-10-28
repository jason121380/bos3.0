import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_DESIGNER_NAME_FOR_CUSTOMER_SIDE = settingsQuery(gql`
  query getDesignerNameForCustomerSide {
    getDesignerNameForCustomerSide
  }
`)

export default function useFetchGetDesignerNameForCustomerSide() {
  return useQuery(GET_DESIGNER_NAME_FOR_CUSTOMER_SIDE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
