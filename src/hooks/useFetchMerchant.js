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
  return useQuery(MERCHANT, {
    fetchPolicy: 'cache-and-network',
  })
}

// 查詢名稱與第三方卡券查詢同為 FETCH_THIRDPARTYS（原本就同名）：後端可能依 operation name 記錄或判斷，前端無法確認，維持原名不改
//（曾改名為 FETCH_MERCHANT_PERMISSION，已撤回，Jason 2026/10/22）
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
export const useFetchMerchantPermission = () =>
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
export const useFetchTHirdPartys = () =>
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
export const useFetchThirdPartysInOrderDetail = () =>
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
export const useFetchThirdPartysForCreateOrder = () =>
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
