import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PRODUCT_PURPOSE = settingsQuery(gql`
  query GET_PRODUCT_PURPOSE {
    getProductPurpose 
  }
`)

const useFetchGetProductPurpose = () => {
  return useQuery(GET_PRODUCT_PURPOSE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export default useFetchGetProductPurpose
