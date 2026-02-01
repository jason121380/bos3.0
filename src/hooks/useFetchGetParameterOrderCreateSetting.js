import { gql, useQuery } from '@apollo/client'

const GET_PARAMETER_ORDER_CREATE_SETTING = gql`
  query GET_PARAMETER_ORDER_CREATE_SETTING {
    getParameterOrderCreateSetting {
      isHelperDesignationDisplay
      isThirdPartTicketDisplay
      isDateLockDisplay
      isDetailBottomed
      orderWithoutCustomerDefault
      isQuickOrderModeOn
      isAbleToChangeDateTimeInOrderCreate
      isAutoSetPreferDesigner
      isTicketSellSubItem
      printFormat
      designerNameDisplayOnInvoice
      isServiceLocked
      isProductLocked
      isTicketLocked
      designationSettingForOrderCreate
      isServiceBindedThirdPartTicketLocked
      isPrintWindowClosureDelayed
      isOrderSerialNumberUsing
      isLBCusDisplay
      isCusWalletUsageForOrder
      logoDisplayOnInvoice {
        isDisplay
        imageUrl
      }
      messageDisplayOnInvoice {
        isDisplay
        message
      }
      qrcodeDisplayOnInvoice {
        isDisplay
        url
        imageUrl
      }
    }
  }
`

export default function useFetchGetParameterOrderCreateSetting() {
  return useQuery(GET_PARAMETER_ORDER_CREATE_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_PRINT_WINDOW_CLOSURE_DELAYED = gql`
  query GET_PRINT_WINDOW_CLOSURE_DELAYED {
    getParameterOrderCreateSetting {
      isPrintWindowClosureDelayed
    }
  }
`

export function useFetchGetIsPrintWindowClosureDelayed() {
  return useQuery(GET_PRINT_WINDOW_CLOSURE_DELAYED, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_SERIAL_NUMBER_USING = gql`
  query GET_SERIAL_NUMBER_USING {
    getParameterOrderCreateSetting {
      isOrderSerialNumberUsing
    }
  }
`

export function useFetchGetSerialNumberUsing() {
  return useQuery(GET_SERIAL_NUMBER_USING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_LBCUS_DISPLAY = gql`
  query GET_IS_LBCUS_DISPLAY {
    getParameterOrderCreateSetting {
      isLBCusDisplay
    }
  }
`

export function useFetchGetIsLBCusDisplay() {
  return useQuery(GET_IS_LBCUS_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_CUS_WALLET_USAGE_FOR_ORDER = gql`
  query GET_IS_CUS_WALLET_USAGE_FOR_ORDER {
    getParameterOrderCreateSetting {
      isCusWalletUsageForOrder
    }
  }
`

export function useFetchGetIsCusWalletUsageForOrder() {
  return useQuery(GET_IS_CUS_WALLET_USAGE_FOR_ORDER, {
    fetchPolicy: 'cache-and-network',
  })
}