import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_PASSWORD = settingsQuery(gql`
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
`)

export default function useFetchMerchantPassword() {
  return useQuery(GET_MERCHANT_PASSWORD, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_MERCHANT_PASSWORD_IS_USING = settingsQuery(gql`
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
`)

export function useFetchMerchantPasswordIsUsing() {
  return useQuery(GET_MERCHANT_PASSWORD_IS_USING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_STOCK_IN_USING = settingsQuery(gql`
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
`)

export function useFetchGetStockInIsUsing() {
  return useQuery(GET_STOCK_IN_USING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_DELETE_ORDER_USING= settingsQuery(gql`
  query GET_DELETE_ORDER_USING {
    merchantPassword {
      deleteOrder {
        isUsing
      }
    }
  }
`)

export function useFetchGetDeleteOrderUsing() {
  return useQuery(GET_DELETE_ORDER_USING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_CANCEL_BOOKING_USING = settingsQuery(gql`
  query GET_CANCEL_BOOKING_USING {
    merchantPassword {
      cancelReservation {
        isUsing
      }
    }
  }
`)

export function useFetchGetCancelBookingUsing() {
  return useQuery(GET_CANCEL_BOOKING_USING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}