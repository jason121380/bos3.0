import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_PASSWORD = gql`
  query GET_MERCHANT_PASSWORD {
    merchantPassword {
      superPassword
      reCheckoutOrder {
        password
        isUsing
      }
      deleteOrder {
        password
        isUsing
      }
      restoreCheckout {
        password
        isUsing
      }
      deleteProduct {
        password
        isUsing
      }
      deleteCustomer {
        password
        isUsing
      }
      deleteService {
        password
        isUsing
      }
      editMoneyFlow {
        password
        isUsing
      }
      purchaseStockIn {
        password
        isUsing
      }
      purchaseStockInUndo {
        password
        isUsing
      }
      cancelReservation {
        password
        isUsing
      }
    }
  }
`

export default function useFetchMerchantPassword() {
  return useQuery(GET_MERCHANT_PASSWORD, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_PASSWORD_IS_USING = gql`
  query GET_MERCHANT_PASSWORD_IS_USING {
    merchantPassword {
      reCheckoutOrder {
        isUsing
      }
      deleteOrder {
        isUsing
      }
      restoreCheckout {
        isUsing
      }
      deleteProduct {
        isUsing
      }
      deleteCustomer {
        isUsing
      }
      deleteService {
        isUsing
      }
      editMoneyFlow {
        isUsing
      }
    }
  }
`

export function useFetchMerchantPasswordIsUsing() {
  return useQuery(GET_MERCHANT_PASSWORD_IS_USING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_STOCK_IN_USING = gql`
  query GET_STOCK_IN_USING {
    merchantPassword {
      purchaseStockIn {
        isUsing
      }
      purchaseStockInUndo {
        isUsing
      }
    }
  }
`

export function useFetchGetStockInIsUsing() {
  return useQuery(GET_STOCK_IN_USING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_DELETE_ORDER_USING = gql`
  query GET_DELETE_ORDER_USING {
    merchantPassword {
      deleteOrder {
        isUsing
      }
    }
  }
`

export function useFetchGetDeleteOrderUsing() {
  return useQuery(GET_DELETE_ORDER_USING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_CANCEL_BOOKING_USING = gql`
  query GET_CANCEL_BOOKING_USING {
    merchantPassword {
      cancelReservation {
        isUsing
      }
    }
  }
`

export function useFetchGetCancelBookingUsing() {
  return useQuery(GET_CANCEL_BOOKING_USING, {
    fetchPolicy: 'cache-and-network',
  })
}
