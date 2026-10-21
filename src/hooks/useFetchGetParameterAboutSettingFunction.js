import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PARAMETER_ABOUT_SETTING_FUNCTION = settingsQuery(gql`
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
`)

export default function useFetchGetParameterAboutSettingFunction() {
  return useQuery(GET_PARAMETER_ABOUT_SETTING_FUNCTION, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_IS_BONUS_REWARD_WITH_LINE = settingsQuery(gql`
  query GET_IS_BONUS_REWARD_WITH_LINE {
    getParameterAboutSettingFunction {
      isBonusRewardWithLine
    }
  }
`)

export function useFetchGetIsBonusRewardWithLine() {
  return useQuery(GET_IS_BONUS_REWARD_WITH_LINE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_IS_UN_LIM_PROD_EMP_PRICE = settingsQuery(gql`
  query GET_IS_UN_LIM_PROD_EMP_PRICE {
    getParameterAboutSettingFunction {
      isUnlimProdEmpPrice
    }
  }
`)

export function useFetchGetisUnlimProdEmpPrice() {
  return useQuery(GET_IS_UN_LIM_PROD_EMP_PRICE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_IS_COMBO_SETTING = settingsQuery(gql`
  query GET_IS_COMBO_SETTING {
    getParameterAboutSettingFunction {
      isComboUsing
    }
  }
`)

export function useFetchGetIsComboSetting() {
  return useQuery(GET_IS_COMBO_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_DISBLE_PENDING_ORDER = settingsQuery(gql`
  query GET_DISBLE_PENDING_ORDER {
    getParameterAboutSettingFunction {
      disablePendingOrder
    }
  }
`)

export function useFetchGetDisablePendingOrder() {
  return useQuery(GET_DISBLE_PENDING_ORDER, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
