import { gql, useQuery } from '@apollo/client'

const FETCH_CUSTOMER_ORDERS = gql`
  query FETCH_CUSTOMER_ORDERS($input: OrdersInput!) {
    viewer {
      customer {
        orders(input: $input) {
          pageLimit
          pageOffset
          totalCount
          orders {
            id
            isDesignate
            date
            isReserved
            payType
            walletPay
            amountByOtherPay
            status
            reference
            serviceFakeTotal
            productFakeTotal
            ticketFakeTotal
            serviceOtherPayFee
            serviceThirdPartyPayFee
            productOtherPayFee
            productThirdPartyPayFee
            ticketOtherPayFee
            ticketThirdPartyPayFee
            cashTotal
            payType2
            serviceCategory {
              id
              name
            }
            customer {
              id
              name
              cellphone
            }
            designer {
              id
              name
              designerNo
            }
            isCloseAccount
            closeAccountDate
            no
            serviceOrders {
              id
              price
              thirdPartyPayName
            }
            productOrders {
              id
              name
              price
            }
            ticketOrders {
              id
              name
              price
            }
            useTicketOrders {
              id
              name
              price
            }
            previewItem
            serviceRealTotal
            productTotal
            sellTicketTotal
            useTicketTotal
          }
        }
      }
    }
  }
`

const useFetchCustomerOrders = input => {
  return useQuery(FETCH_CUSTOMER_ORDERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export default useFetchCustomerOrders
