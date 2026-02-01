import { gql, useQuery } from '@apollo/client'

const MERCHANT = gql`
  {
    merchant {
      id
      openingHours
      closingHours
    }
  }
`

export default function useFetchMerchant() {
  return useQuery(MERCHANT)
}

const FETCH_MERCHANT_PERMISSION = gql`
  query FETCH_THIRDPARTYS {
    merchant {
      id
      permissions {
        id
        name
        code
        actions {
          id
          name
          code
        }
      }
    }
  }
`
export const useFetchMerchantPermission = date =>
  useQuery(FETCH_MERCHANT_PERMISSION, {
    fetchPolicy: 'cache-and-network',
  })

const FETCH_THIRDPARTYS = gql`
  query FETCH_THIRDPARTYS {
    merchant {
      id
      thirdpartyCoupons {
        id
        name
        fee
        type
      }
    }
  }
`
export const useFetchTHirdPartys = date =>
  useQuery(FETCH_THIRDPARTYS, {
    fetchPolicy: 'cache-and-network',
  })

const FETCH_THIRDPARTYS_IN_ORDER_DETAIL = gql`
  query FETCH_THIRDPARTYS_IN_ORDER_DETAIL {
    merchant {
      thirdpartyCoupons {
        id
        name
      }
    }
  }
`
export const useFetchThirdPartysInOrderDetail = date =>
  useQuery(FETCH_THIRDPARTYS_IN_ORDER_DETAIL, {
    fetchPolicy: 'cache-and-network',
  })

const FETCH_THIRDPARTYS_FOR_CREATE_ORDER = gql`
  query FETCH_THIRDPARTYS_FOR_CREATE_ORDER {
    merchant {
      thirdpartyCoupons {
        id
        fee
        type
      }
    }
  }
`
export const useFetchThirdPartysForCreateOrder = date =>
  useQuery(FETCH_THIRDPARTYS_FOR_CREATE_ORDER, {
    fetchPolicy: 'cache-and-network',
  })

const FETCH_MONTHLY_CLOSE_STATUS = gql`
  query FETCH_MONTHLY_CLOSE_STATUS($date: DateTime!) {
    merchant {
      id
      monthlyCloseStatus(date: $date) {
        isCloseMonthly
        isOutput
      }
    }
  }
`

export const useFethcMonthlyCloseStatus = date =>
  useQuery(FETCH_MONTHLY_CLOSE_STATUS, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_MERCHANT_SALES_ANALYTICS = gql`
  query FETCH_MERCHANT_SALES_ANALYTICS($input: DateTimeInput) {
    merchant {
      salesAnalytics(input: $input) {
        serviceFakeTotal
        productTotal
        useTicketTotal
        sellTicketTotal
      }
    }
  }
`

export const useFetchMerchantSalesAnalytics = input =>
  useQuery(FETCH_MERCHANT_SALES_ANALYTICS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_MERCHANT_CUSTOMER_COUNT = gql`
  query FETCH_MERCHANT_CUSTOMER_COUNT($input: DateTimeInput) {
    merchant {
      salesAnalytics(input: $input) {
        #服務消費虛業績
        serviceFakeTotal
        #店販消費
        productTotal
        #卡券使用
        useTicketTotal
        #卡卷銷售
        sellTicketTotal
        #總客數
        customerCount
        #客單價
        customerAvgAmount
        #指定客
        designateCount
        #不指定
        notDesignateCount
        #男客
        maleCount
        #女客
        femaleCount
        #未知性別
        unknowGenderCount
      }
    }
  }
`

export const useFetchCustomerCount = input =>
  useQuery(FETCH_MERCHANT_CUSTOMER_COUNT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
