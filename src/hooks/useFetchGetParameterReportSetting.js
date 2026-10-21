import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PARAMETER_REPORT_SETTING = settingsQuery(gql`
  query GET_PARAMETER_REPORT_SETTING {
    getParameterReportSetting {
      isPriceDisplayOnDailyReport
      isOptimizationPrintModeOn
      isServiceNameDisplayByCategory
      isDisplayHelperRetrieveInDailyReport
      isZeroValueHiddenOnDailyReport
      isHelperPointPriceDisplay
      isUsingMathRoundInDesignerDailyReport
      isNoCashWalletGroupedInMDR
      designerNameForReportType
      isDesignerSalaryDisplayOnBalanceReport
      isCustomerDataMarked
      isMonthlyAverageDisplayForDesignerLeaderBoard
      isMonthlyAverageDisplayForMerchantLeaderBoard
      isProductCostDisplay
      isServiceTicketMerged
      isOpenDateRangeInOrderMangement
      isDisplayTogglePerformanceButton
      CARPTDisplay
      isDRROCDisplay
      isDRRPEVDisplay
      isEDCIFilterDisplay
      multiStorePerfRef
      isMultiStoreStaffPerfMergedHL
      isMultiStoreStaffPerfMergedDL
      isTSNoOT
      nonCashDisplay
    }
  }
`)

export default function useFetchGetParameterReportSetting() {
  return useQuery(GET_PARAMETER_REPORT_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_CARPTDISPLAY = settingsQuery(gql`
  query GET_CARPTDISPLAY {
    getParameterReportSetting {
      CARPTDisplay
    }
  }
`)


export function useFetchGetCARPTDISPLAY() {
  return useQuery(GET_CARPTDISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_DRR_DATA_DISPLAY = settingsQuery(gql`
  query GET_DRR_DATA_DISPLAY {
    getParameterReportSetting {
      isDRROCDisplay
      isDRRPEVDisplay
    }
  }
`)

export function useFetchGetDRRDataDisplay() {
  return useQuery(GET_DRR_DATA_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_EMPLOYEECLOCKIN_DISPLAY = settingsQuery(gql`
  query GET_EMPLOYEECLOCKIN_DISPLAY {
    getParameterReportSetting {
      isEDCIFilterDisplay
    }
  }
`)

export function useFetchGetEmployeeClockInDisplay() {
  return useQuery(GET_EMPLOYEECLOCKIN_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_NONCASH_DISPLAY = settingsQuery(gql`
  query GET_NONCASH_DISPLAY {
    getParameterReportSetting {
      nonCashDisplay
    }
  }
`)

export function useFetchGetNonCashDisplay() {
  return useQuery(GET_NONCASH_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}