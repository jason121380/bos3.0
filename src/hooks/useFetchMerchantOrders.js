import { gql, useQuery, useLazyQuery } from '@apollo/client'

const MERCHANT_ORDER = gql`
  query merchantOrders($input: MerchantOrdersInput!) {
    merchantOrders(input: $input) {
      designer {
        id
        name
        gender
        designerNo
        bookingLimit
      }
      servicesTimesList {
        startTime
        endTime
        status
        orders {
          id
          status
          isDesignate
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
          }
          friends {
            customer {
              id
              name
              cellphone
            }
            serviceList {
              name
            }
          }
          remark
          remarkForCustomer
          isBookingCostUsing
        }
      }
    }
  }
`

export default function useFetchMerchantOrders(input) {
  return useQuery(MERCHANT_ORDER, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const MERCHANT_ORDER_BY_TIME = gql`
  query merchantOrdersForDay($input: MerchantOrdersInput!) {
    merchantOrdersByTime(input: $input) {
      date
      designerData {
        designer {
          id
          name
          nickName
          gender
          designerNo
          bookingLimit
        }
        servicesTimesList {
        startTime
        status
        orders {
          id
          date
          status
          isDesignate
          customer {
            id
            name
            cellphone
          }
          designer {
            id
            name
          }
          remark
          remarkForCustomer
          timeCost
          isBookingCostUsing
        }
      }
      }
    }
  }
`

export function useFetchMerchantOrdersByTime(input) {
  return useQuery(MERCHANT_ORDER_BY_TIME, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchMerchantOrdersByTimeLazy() {
  const [getMerchantOrders, merchantOrdersData] = useLazyQuery(MERCHANT_ORDER_BY_TIME, {
    fetchPolicy: 'cache-and-network',
  })
  return [getMerchantOrders, merchantOrdersData]
}