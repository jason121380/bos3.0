import { gql, useQuery } from '@apollo/client'

const GET_PARAMETER_ABOUT_SETTING_FUNCTION = gql`
  query GET_PARAMETER_ABOUT_SETTING_FUNCTION {
    getParameterAboutSettingFunction {
      isMemberShipCardActive
      isCustomerBonusActive
      isComboUsing
      isAutoClearAddedTimeInScheduleTable
      isMerchantScheduleDisplay
      isPriceDisplayOnCustomerSide
      isDailyCheckoutBlockedByDraftOrder
      isEmployeeScheduleWorkingHourDisplay
      isReportListExtended
      isEmployeeScheduleUndoActive
      isCustomerSelfCreateActive
      designerNameForCustomerSide
      actionsBannedAfterDailyCheckout
      isBookingTimeNoLimit
      isBonusConversion
      bonusConversionRate
      isEventDisplayOnDayBookingRecord
      isWalletFinNonNeg
      isBonusRewardWithLine
      isUnlimProdEmpPrice
      disablePendingOrder
      openingTimeForDisplay {
        openingHoursForDisplay
        closingHoursForDisplay
      }
      bonusRewardRule {
        isUsing
        rule {
          price
          bonus
          mode
        }
      }
    }
  }
`

export default function useFetchGetParameterAboutSettingFunction() {
  return useQuery(GET_PARAMETER_ABOUT_SETTING_FUNCTION, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_BONUS_REWARD_WITH_LINE = gql`
  query GET_IS_BONUS_REWARD_WITH_LINE {
    getParameterAboutSettingFunction {
      isBonusRewardWithLine
    }
  }
`

export function useFetchGetIsBonusRewardWithLine() {
  return useQuery(GET_IS_BONUS_REWARD_WITH_LINE, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_UN_LIM_PROD_EMP_PRICE = gql`
  query GET_IS_UN_LIM_PROD_EMP_PRICE {
    getParameterAboutSettingFunction {
      isUnlimProdEmpPrice
    }
  }
`

export function useFetchGetisUnlimProdEmpPrice() {
  return useQuery(GET_IS_UN_LIM_PROD_EMP_PRICE, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_COMBO_SETTING = gql`
  query GET_IS_COMBO_SETTING {
    getParameterAboutSettingFunction {
      isComboUsing
    }
  }
`

export function useFetchGetIsComboSetting() {
  return useQuery(GET_IS_COMBO_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_DISBLE_PENDING_ORDER = gql`
  query GET_DISBLE_PENDING_ORDER {
    getParameterAboutSettingFunction {
      disablePendingOrder
    }
  }
`

export function useFetchGetDisablePendingOrder() {
  return useQuery(GET_DISBLE_PENDING_ORDER, {
    fetchPolicy: 'cache-and-network',
  })
}
