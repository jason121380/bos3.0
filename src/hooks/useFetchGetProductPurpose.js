import { gql, useQuery } from '@apollo/client'

const GET_PRODUCT_PURPOSE = gql`
  query GET_PRODUCT_PURPOSE {
    getProductPurpose 
  }
`

const useFetchGetProductPurpose = () => {
  return useQuery(GET_PRODUCT_PURPOSE, {
    fetchPolicy: 'cache-and-network',
  })
}

export default useFetchGetProductPurpose