import { gql, useQuery } from '@apollo/client'

const GET_PRODUCT_CONSUME_LIST = gql`
  query GET_PRODUCT_CONSUME_LIST($input: ProductConsumeListInput!) {
    productConsumeList(input: $input) {
      productConsumeRecord {
        date
        designerNo
        designerName
        productNo
        productName
        count
        unit
        unitCost
        unitPrice
        subTotal
        purpose
      }
      productConsumeSummary {
        purpose
        cost
        price
        count
      }
    }
  }
`

export default function useFetchProductConsumeList(input) {
  return useQuery(GET_PRODUCT_CONSUME_LIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
