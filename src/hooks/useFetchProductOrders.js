import { gql, useQuery } from '@apollo/client'

const PRODUCT_ORDERS = gql`
  query PRODUCT_ORDERS($input: ProductOrdersInput!) {
    productOrders(input: $input) {
      totalCount
      pageLimit
      pageOffset
      data {
        id
        # 商品名稱
        name
        product {
          id
          # 代號
          no
          name
        }
        seller {
          id
          name
          designerNo
        }
        # 數量
        count
        # 單價
        price
        price2
        # 抽成
        #commissionDeduction
        commission
        # 手續費
        handlingFee
        # 抽成方式
        rakeType
        order {
          id
          no
          date
          customer {
            no
            name
          }
        }
      }
    }
  }
`

export default function useFetchProductOrders(input) {
  return useQuery(PRODUCT_ORDERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
