import { gql, useLazyQuery } from '@apollo/client'

const GET_PRODUCT_RESERVE_CHECK = gql`
  query GET_PRODUCT_RESERVE_CHECK($input: ProductReserveCheckInput!) {
    productReserveCheck(input: $input) {
      productReserveChecks {
        productName
        id
        reserveChecks {
          title
          in
          out
          balance
          isCreated
        }
      }
      reserveCheckSummary {
        id
        productName
        reserveCount
        price
        reservePrice
      }
    }
  }
`

export default function useFetchGetProductReserveCheck() {
  const [getProductReserve, productReserveData] = useLazyQuery(GET_PRODUCT_RESERVE_CHECK, {
    fetchPolicy: 'cache-and-network',
  })
  return [getProductReserve, productReserveData]
}