import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'

const FETCH_UPDATE_USER_PERMISSION = gql`
  mutation updateUserPermission($input: UpdateUserPermissionInput!) {
    updateUserPermission(input: $input)
  }
`

export const useUpdateUserPermission = ({ input }) => {
  const [updateUserPermission] = useMutation(FETCH_UPDATE_USER_PERMISSION)
  return {
    updateUserPermission: ({ input }) => updateUserPermission({ variables: { input } }),
  }
}

const FETCH_USER_PERMISSIONS = gql`
  query GetUserPermission($input: UserInput!) {
    user(input: $input) {
      id
      permissionActions {
        id
      }
    }
  }
`

export const useFetchUserPermission = ({ input }) =>
  useQuery(FETCH_USER_PERMISSIONS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
const FETCH_USER_ATTENDANCE = gql`
  query FETCH_USER_ATTENDANCE($userInput: UserInput!, $allAttendanceInput: AllAttendanceInput!) {
    user(input: $userInput) {
      name
      id
      attendanceRecords(input: $allAttendanceInput) {
        pageLimit
        pageOffset
        totalCount
        records {
          latitude
          longitude
          checkinDateTime
        }
      }
    }
  }
`

export function useFetchUserAttendance({ userInput, allAttendanceInput }) {
  return useQuery(FETCH_USER_ATTENDANCE, {
    variables: {
      userInput,
      allAttendanceInput,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchUserAttendanceLazy() {
  const [fetchUserAttendanceLazy, uerAttendanceLazyData] = useLazyQuery(FETCH_USER_ATTENDANCE, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchUserAttendanceLazy, uerAttendanceLazyData }
}

const FETCH_USER_SALARY = gql`
  query FETCH_USER_SALARY($input: UserInput!, $date: DateTime!) {
    user(input: $input) {
      id
      designerNo
      name
      jobTitle
      remarkForSalary(date: $date)
      salary(date: $date) {
        id
        date
        status
        points
        pointAmount
        designateSales
        notDesignateSales
        # 加項-工資
        wage
        # 加項-護髮抽成
        hairCareCommission
        # 加項-伙食津貼
        mealAllowance
        # 加項-燙染抽成
        hotDyeingCommission
        # 加項-職務加給
        additionOfDuties
        # 加項-其他抽成
        otherCommission
        # 加項-勞健保勞退
        laborhealthInsurance
        # 加項-其他津貼
        otherAllowance
        # 加項-全勤獎金
        attendanceBonus
        # 加項-獎勵金
        reward
        # 加項-售貨獎金
        salesBonus
        # 加項-顧客還單
        customerReturn
        # 加項-業績抽成
        salesCommission
        # 加項-績效抽成
        performanceCommission
        # 加項-特殊抽成
        specialCommission
        # 加項-洗髮抽成
        shampooCommission
        # 扣項-學費
        tuition
        # 扣項-違規扣款
        illegalCharge
        # 扣項-薪資欠款
        salaryArrears
        # 扣項-教育費
        educationFee
        # 扣項-遲退未刷
        lateRetreat
        # 扣項-顧客欠單
        customerArrears
        # 扣項-旅遊基金
        tourismFund
        # 扣項-未達責任扣款
        DeductionOfLiabilityDue
        # 扣項-曠職扣款
        derelictionOfDuty
        # 扣項-儲蓄金
        savings
        # 扣項-贈品扣款
        giftdeduction
        # 扣項-福利金
        welfare
        # 扣項-管理處用具
        managementOfficeEquipment
        # 扣項-勞健保費
        laborHealthPremium
        # 扣項-互助扣款
        mutualDeduction
        # 扣項-自購材料
        selfPurchasedMaterials
        # 扣項-代墊款
        advances
        # 扣項-員工借支
        employeeLoan
        # 扣項-宿舍費用
        dormitoryCosts
        # 扣項-事病假扣款
        deductionForSickLeave
        # 扣項-信用卡手續費
        creditCardFee
      }
    }
  }
`

export const useFetchUserSalary = ({ input, date }) => {
  return useQuery(FETCH_USER_SALARY, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_PERFORM_DAILY = gql`
  query FETCH_PERFORM_DAILY($input: UsersInput!, $startDate: DateTime!, $endDate: DateTime!) {
    users(input: $input) {
      users {
        id
        name
        salesReport {
          # 類別業績
          serviceOrders(input: { startDate: $startDate, endDate: $endDate }) {
            id
            # 項目
            name
            price
            service {
              # 類別
              serviceCategory {
                id
                name
              }
            }
            order {
              id
              no
              designer {
                id
                name
              }
            }
          }
          # 互助紀錄
          serviceOrderHelpers(input: { startDate: $startDate, endDate: $endDate }) {
            id
            # 點數
            point
            # 點數換算
            pointAmount
            # 抽固定金額
            fixCommissionAmount
            # 抽%
            commissionPercent
            # 抽%換算
            commissionAmount
            serviceOrder {
              id
              # 項目
              name
              order {
                id
                no
                designer {
                  id
                  # 互助設計師
                  name
                }
              }
            }
          }
          # 店販業績
          productOrders(input: { startDate: $startDate, endDate: $endDate }) {
            id
            price
            commission
            seller {
              id
              name
            }
            product {
              name
              productCategory {
                id
                name
              }
            }
            order {
              id
              no
            }
          }
          # 業績統計（本日）
          performanceStatisticsToday: performanceStatistics(
            input: { startDate: $startDate, endDate: $endDate }
          ) {
            #服務實業績
            serviceRealPerformance
            #指定服務實業績
            designatedServiceRealPerformance
            #固定扣項
            serviceDeductionPrice
            #助理使用扣項
            helperDeductionPrice
            #店販業績
            productSales
            #店販抽成
            productCommission
            #總客數
            customerCount
            #客單價
            customerAvgPrice
            #指定客數
            designateCount
            #不指定客數
            notDesignateCount
            #男客
            maleCount
            #女客
            femaleCount
            #互助次數
            helpCount
            #互助加項
            helperAmount
            # 助理欄位========
            # 抽固定金額
            fixAmount
            # 點數
            point
            # 點數換算
            pointAmount
          }
          # 業績統計（本月）
          performanceStatisticsMonthly: performanceStatistics(
            input: { startDate: $startDate, endDate: $endDate }
          ) {
            #服務實業績
            serviceRealPerformance
            #指定服務實業績
            designatedServiceRealPerformance
            #固定扣項
            serviceDeductionPrice
            #助理使用扣項
            helperDeductionPrice
            #店販業績
            productSales
            #店販抽成
            productCommission
            #總客數
            customerCount
            #客單價
            customerAvgPrice
            #指定客數
            designateCount
            #不指定客數
            notDesignateCount
            #男客
            maleCount
            #女客
            femaleCount
            #互助次數
            helpCount
            #互助加項
            helperAmount
            # 助理欄位
            # 助理欄位========
            # 抽固定金額
            fixAmount
            # 點數
            point
            # 點數換算
            pointAmount
          }
        }
      }
    }
  }
`

export const useFetchPerformDaily = ({ input, startDate, endDate }) =>
  useQuery(FETCH_PERFORM_DAILY, {
    variables: {
      input,
      startDate,
      endDate,
    },
  })

const FETCH_DESIGNER_SALES_DETAIL = gql`
  query FETCH_DESIGNER_SALES_DETAIL($input: UserInput, $date: DateTimeInput!) {
    user(input: $input) {
      salesAnalytics(input: $date) {
        # 服務消費
        serviceFake
        # 店販消費
        productSales
        # 卡卷使用
        useTicketSales
        # 卡卷販賣(不入業績)
        sellTicketSales
        # 客單價
        customerAvgAmount
        # 指定客
        designateCustomerCount
        # 不指定
        notDesignateCustomerCount
        # 男客
        maleCustomerCount
        # 女客
        femaleCustomerCount
        # 未知性別
        unKnowCustomerCount
        # 指定虛業績
        designateServiceFake
        # 不指定虛業績
        notDesignateServiceFake
        # 指定實業績
        designateServiceReal
        # 不指定實業績
        notDesignateServiceReal
      }
    }
  }
`

export const useLazyFetchDesignerSalesDetail = variables => {
  const [fetchDesignerSalesDetail, designerSalesDetail] = useLazyQuery(
    FETCH_DESIGNER_SALES_DETAIL,
    {
      variables,
      fetchPolicy: 'cache-and-network',
    }
  )
  return {
    fetchDesignerSalesDetail,
    designerSalesDetail,
  }
}

const MERCHANT_ORDER_RECORD = gql`
  query($userInput: UserInput, $merchantOrderRecordsInput: MerchantOrderRecordsInput) {
    user(input: $userInput) {
      id
      name
      merchantOrderRecords(input: $merchantOrderRecordsInput) {
        startTime
        endTime
        status
        orders {
          id
          no
          isDesignate
          status
          serviceCategory {
            id
            name
          }
          designer {
            id
            name
          }
          customer {
            id
            name
            cellphone
          }
          friends {
            customer {
              id
              name
              cellphone
            }
          }
        }
      }
    }
  }
`

export const useFetchUserMerchantOrderRecords = ({ userInput, merchantOrderRecordsInput }) =>
  useQuery(MERCHANT_ORDER_RECORD, {
    variables: { userInput, merchantOrderRecordsInput },
  })

const FETCH_USER = gql`
  query FETCH_USER($input: UserInput) {
    user(input: $input) {
      id
      userCode
      cellphone
      name
      firstName
      lastName
      pageAuthority {
        authorityName
        pageAuthority {
          pageTitle
          authority
          pageAuthority {
            pageName
            authority
          }
        }
      }
      displayRate
      theme
    }
  }
`

export default function useFetchUser(input) {
  return useQuery(FETCH_USER, {
    variables: {
      input,
    },
  })
}

const FETCH_IS_WHITE_LIST = gql`
  query FETCH_IS_WHITE_LIST($input: UserInput) {
    user(input: $input) {
      isWhiteList
    }
  }
`

export function useFetchIsWhiteList(input) {
  return useQuery(FETCH_IS_WHITE_LIST, {
    variables: {
      input,
    },
  })
}

const FETCH_USER_SALES_ANALYTICS = gql`
  query FETCH_USER($input: UserInput, $dateTimeInput: DateTimeInput!) {
    user(input: $input) {
      id
      salesAnalytics(input: $dateTimeInput) {
        servicePerformanceFakeTotal
        servicePerformanceDesignateFakeTotal
        servicePerformanceNonDesignateFakeTotal
        serviceThirdPartHandlingFeeOnSales
        servicePerformanceDecountItem
        servicePerformanceDecountHelperUsagePrice
        servicePerformanceDecountHelperUsagePoint
        servicePerformanceTruthTotal
        servicePerformanceDesignateTruthTotal
        servicePerformanceNonDesignateTruthTotal
        servicePerformanceRake
        serviceThirdPartHandlingFeeOnSalary
        serviceSalaryDecountItem
        serviceSalaryDecountHelperUsagePrice
        serviceSalaryDecountHelperUsagePoint
        serviceSalaryShouldBePaid
        ticketUsagePerformanceFakeTotal
        ticketThirdPartHandlingFeeOnSales
        ticketPerformanceDecountItem
        ticketPerformanceDecountHelperUsage
        ticketUsagePerformanceTruthTotal
        ticketPerformanceRake
        ticketThirdPartHandlingFeeOnSalary
        ticketSalaryDecountItem
        ticketSalaryDecountHelperUsagePrice
        ticketSalaryDecountHelperUsagePoint
        ticketSalaryShouldBePaid
        productPerformanceFakeTotal
        productThirdPartHandlingFee
        productPerformanceTruthTotal
        productRakeByFixed
        productRakeByCost
        productRakeByPrice
        productSalaryShouldBePaid
        helperRetrievePoint
        helperRetrievePrice
        totalSalaryShouldBePaid
        ticketSellingFake
        ticketSellingTruth
        walletDepositFake
        walletDepositTruth
        customerTotalCount
        customerMaleCount
        customerFemaleCount
        customerUnknownCount
        customerAveragePrice
        customerAveragePriceWithProduct
        orderTotalCount
        orderMaleCount
        orderFemaleCount
        orderUnknownCount
        orderDesignateCount
        orderNonDesignateCount
        orderAveragePrice
        orderAveragePriceWithProduct
        hairWashing
        hairWashingCount
        hairCutting
        hairCuttingCount
        permanent
        permanentCount
        hairDying
        hairDyingCount
        hairTreatment
        hairTreatmentCount
        scalpTreatment
        scalpTreatmentCount
        hairExtension
        hairExtensionCount
        hairStyling
        hairStylingCount
        workingDays
      }
    }
  }
`

export function useFetchUserSalesAnalytics({ input, dateTimeInput }) {
  return useQuery(FETCH_USER_SALES_ANALYTICS, {
    variables: {
      input,
      dateTimeInput,
    },
  })
}

const FETCH_USER_IS_SALARYCHECKED = gql`
  query FETCH_USER_IS_SALARYCHECKED($input: UserInput, $date: DateTime!) {
    user(input: $input) {
      isSalaryItemLocked(date: $date)
    }
  }
`

export function useFetchIsUserSalaryChecked({ input, date }) {
  return useQuery(FETCH_USER_IS_SALARYCHECKED, {
    variables: {
      input,
      date,
    },
  })
}

const FETCH_USER_LAZY = gql`
  query FETCH_USER_LAZY($input: UserInput) {
    user(input: $input) {
      pageAuthority {
        authorityName
        pageAuthority {
          pageTitle
          authority
          pageAuthority {
            pageName
            authority
          }
        }
      }
    }
  }
`

export function useFetchUserLazy() {
  const [userLazy, userLazyData] = useLazyQuery(FETCH_USER_LAZY, {
    fetchPolicy: 'cache-and-network',
  })
  return [userLazy, userLazyData]
}