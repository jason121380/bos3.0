import { gql, useQuery } from '@apollo/client'

const GET_ORDER_STATIC_DETAIL = gql`
  query GET_ORDER_STATIC_DETAIL($orderIds: [ID]) {
    getOrderStaticDetail(orderIds: $orderIds) {
      orderId
      orderStaticDetail {
        designerName
        serviceType
        itemName
        count
        price
        helperList {
          helperName
          helperNo
          helperType
        }
      }
    }
  }
`

export default function useFetchGetOrderStaticDetail(orderIds) {
  return useQuery(GET_ORDER_STATIC_DETAIL, {
    variables: {
      orderIds,
    },
    fetchPolicy: 'cache-and-network',
  })
}
