import { gql, useQuery } from '@apollo/client'

const GET_USERS = gql`
  query FETCH_USERS($input: UsersInput!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        uid
        name
        email
        gender
        avatar
        status
        address
        lastName
        nickName
        jobTitle
        identity
        merchants {
          id
          name
        }
        userGroup
        cellphone
        firstName
        designerNo
        groupCategory
        isNeedChangePassword
        merchantIdentity {
          authorityName
          authorityId
        }
        isUserRakeSet
        isDisplayOnBookingList
        isDisplayOnServiceList
        isDisplayOnPerformanceList
      }
    }
  }
`

const GET_USERS_FOR_MODAL = gql`
  query GET_USERS_FOR_MODAL($input: UsersInput!) {
    users(input: $input) {
      users {
        id
        name
      }
    }
  }
`

export function useFetchUsersForModal(input) {
  return useQuery(GET_USERS_FOR_MODAL, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
export default function useFetchUsersInModal(input) {
  return useQuery(GET_USERS, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
const GET_MERCHANT = gql`
  query FETCH_USERS($input: UsersInput!) {
    users(input: $input) {
      users {
        merchants {
          id
          name
        }
      }
    }
  }
`

export function useFetchMerchants(input) {
  return useQuery(GET_MERCHANT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_USERS_FOR_CREATE_PICKING = gql`
  query GET_USERS_FOR_CREATE_PICKING($input: UsersInput!) {
    users(input: $input) {
      users {
        id
        name
        designerNo
      }
    }
  }
`

export function useFetchUsersForCreatePicking(input) {
  return useQuery(GET_USERS_FOR_CREATE_PICKING, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_USER_SALARIES = gql`
  query FETCH_USER_SALARIES($input: UsersInput!, $date: DateTime!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        name
        designerNo
        jobTitle
        salary(date: $date) {
          id
          additionAmount
          deductionAmount
          date
          status
          points
          designateSales
          notDesignateSales
          pointAmount
          # 天數
          days
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
          # ==================================
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
  }
`

export const useFetchUserSalaries = ({ input, date }) => {
  return useQuery(FETCH_USER_SALARIES, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_USER_SALARY_INCREASE = gql`
  query FETCH_USER_SALARY_INCREASE($input: UsersInput!, $date: DateTime!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        name
        designerNo
        jobTitle
        salary(date: $date) {
          id
          date
          status
          pointAmount
          # 天數
          days
          # 加項-工資
          wage
          # 加項-伙食津貼
          mealAllowance
          # 加項-職務加給
          additionOfDuties
          # 加項-勞健保勞退
          laborhealthInsurance
          # 加項-全勤獎金
          attendanceBonus
          # 加項-售貨獎金
          salesBonus
          # 加項-業績抽成
          salesCommission
          # 加項-特殊抽成
          specialCommission
          # 加項-洗髮抽成
          shampooCommission
          # 加項-護髮抽成
          hairCareCommission
          # 加項-燙染抽成
          hotDyeingCommission
          # 加項-其他抽成
          otherCommission
          # 加項-其他津貼
          otherAllowance
          # 加項-獎勵金
          reward
          # 加項-顧客還單
          customerReturn
          # 加項-績效抽成
          performanceCommission

          # 指定業績
          designateSales
          # 不指定業績
          notDesignateSales
          points
        }
      }
    }
  }
`
export const useFetchUserIncrease = ({ input, date }) =>
  useQuery(FETCH_USER_SALARY_INCREASE, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
const FETCH_USER_SALARY_DECREASE = gql`
  query FETCH_USER_SALARY_DECREASE($input: UsersInput!, $date: DateTime!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        name
        designerNo
        jobTitle
        salary(date: $date) {
          id
          date
          status
          points
          designateSales
          notDesignateSales
          pointAmount
          # 天數
          days
          # 扣項-學費
          tuition
          # 扣項-教育費
          educationFee
          # 扣項-旅遊基金
          tourismFund
          # 扣項-儲蓄金
          savings
          # 扣項-福利金
          welfare
          # 扣項-勞健保費
          laborHealthPremium
          # 扣項-自購材料
          selfPurchasedMaterials
          # 扣項-員工借支
          employeeLoan
          # 扣項-事病假扣款
          deductionForSickLeave
          # 扣項-違規扣款
          illegalCharge
          # 扣項-遲退未刷
          lateRetreat
          # 扣項-未達責任扣款
          DeductionOfLiabilityDue
          # 扣項-贈品扣款
          giftdeduction
          # 扣項-管理處用具
          managementOfficeEquipment
          # 扣項-互助扣款
          mutualDeduction
          # 扣項-代墊款
          advances
          # 扣項-宿舍費用
          dormitoryCosts
          # 扣項-信用卡手續費
          creditCardFee
          # 扣項-薪資欠款
          salaryArrears
          # 扣項-顧客欠單
          customerArrears
          # 扣項-曠職扣款
          derelictionOfDuty
        }
      }
    }
  }
`
export const useFetchUserDecrease = ({ input, date }) =>
  useQuery(FETCH_USER_SALARY_DECREASE, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_DESIGNER_ANALYTICS = gql`
  query($input: UsersInput!, $date: DateTimeInput!) {
    users(input: $input) {
      users {
        id
        name
        salesAnalytics(input: $date) {
          #服務虛業績
          serviceFake
          #服務實業績
          serviceReal
          #指定實業績
          designateServiceReal
          #店販業績
          productSales
          #指定客數
          designateCustomerCount
          #不指定客數
          notDesignateCustomerCount
        }
      }
    }
  }
`

export const useFetchDesignerAnalytics = ({ input = { showAll: true }, date }) =>
  useQuery(FETCH_DESIGNER_ANALYTICS, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_DESIGNER_SERVICE_CATEGORIES_ANALYTICS = gql`
  query FETCH_DESIGNER_SERVICE_CATEGORIES_ANALYTICS($input: UsersInput!, $date: DateTimeInput!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        name
        serviceCategoriesAnalytics(input: $date) {
          # 洗髮
          shampoo
          # 洗髮人數
          shampooCount
          # 剪髮
          haircut
          # 剪髮人數
          haircutCount
          # 燙髮
          perm
          # 燙髮人數
          permCount
          # 染髮
          hairColoring
          # 燙髮人數
          hairColoringCount
          # 護髮
          haircare
          # 護髮人數
          haircareCount
        }
      }
    }
  }
`

export const useFetchDesignerServiceCategoriesAnalytics = ({ input, date }) =>
  useQuery(FETCH_DESIGNER_SERVICE_CATEGORIES_ANALYTICS, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const ASSISTANT_SALES_OVERVIEW = gql`
  query ASSISTANT_SALES_OVERVIEW($input: UsersInput!, $date: DateTimeInput!) {
    users(input: $input) {
      pageLimit
      pageOffset
      totalCount
      users {
        id
        name
        designerNo
        salesReport {
          performanceStatistics(input: $date) {
            # 抽固定金額
            fixAmount
            # 點數
            point
            # pointAmount
            pointAmount
            # 抽%
            commissionPercent
            # 抽%換算
            commissionAmount
          }
        }
        salesAnalytics(input: $date) {
          #服務虛業績
          serviceFake
          #服務實業績
          serviceReal
          # 指定實業績
          designateServiceReal
          # 指定虛業績
          designateServiceFake
          # 不指定實業績
          notDesignateServiceReal
          # 不指定虛業績
          notDesignateServiceFake
          # 店販業績
          productSales
          # 指定客
          designateCustomerCount
          # 不指定客
          notDesignateCustomerCount
          # 男客
          maleCustomerCount
          # 女客
          femaleCustomerCount
        }
      }
    }
  }
`

export const useFetchAssistantOverview = ({ input, date }) =>
  useQuery(ASSISTANT_SALES_OVERVIEW, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const ASSISTANT_SERVICE_CATEGORIES_ANALYTICS = gql`
  query ASSISTANT_SERVICE_CATEGORIES_ANALYTICS($input: UsersInput!, $date: DateTimeInput!) {
    users(input: $input) {
      totalCount
      pageLimit
      pageOffset
      users {
        id
        name
        designerNo
        serviceCategoriesAnalytics(input: $date) {
          # 洗髮
          shampoo
          # 洗髮人數
          shampooCount
          # 剪髮
          haircut
          # 剪髮人數
          haircutCount
          # 燙髮
          perm
          # 燙髮人數
          permCount
          # 染髮
          hairColoring
          # 燙髮人數
          hairColoringCount
          # 護髮
          haircare
          # 護髮人數
          haircareCount
        }
      }
    }
  }
`

export const useFetchAssistantServiceCategoriesAnalytics = ({ input, date }) =>
  useQuery(ASSISTANT_SERVICE_CATEGORIES_ANALYTICS, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_DESIGNER_SALES_OVERVIEW = gql`
  query FETCH_DESIGNER_SALES_OVERVIEW($input: UsersInput!, $date: DateTimeInput) {
    users(input: $input) {
      totalCount
      pageLimit
      pageOffset
      users {
        id
        name
        salesAnalytics(input: $date) {
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
          productThirdPartHandlingFeeOnSales
          productThirdPartHandlingFeeOnSalary
          productPerformanceTruthTotal
          productRakeByFixed
          productRakeByCost
          productRakeByPrice
          productSalaryShouldBePaid
          helperRetrievePoint
          #helperRetrievePrice
          helperRetrievePriceNoPoint
          helperRetrievePriceOnlyPoint

          helperPricePaidOnlyPointOnSales
          helperPricePaidOnlyPointOnSalary
          helperPricePaidNoPointOnSales
          helperPricePaidNoPointOnSalary

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
          walletDepositHandlingFeeByDesigner
        }
      }
    }
  }
`
export const useFetchDesignerSalesOverview = ({ input, date }) =>
  useQuery(FETCH_DESIGNER_SALES_OVERVIEW, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_DESIGNER_SALES_BASIC = gql`
  query FETCH_DESIGNER_SALES_BASIC($input: UsersInput!, $date: DateTimeInput) {
    users(input: $input) {
      totalCount
      pageLimit
      pageOffset
      users {
        id
        name
        salesAnalytics(input: $date) {
          servicePerformanceFakeTotal
          servicePerformanceDesignateFakeTotal
          servicePerformanceNonDesignateFakeTotal
          ticketUsagePerformanceFakeTotal
          productPerformanceFakeTotal
          helperRetrievePrice
          helperRetrievePoint
        }
      }
    }
  }
`
export const useFetchDesignerSalesBasic = ({ input, date }) =>
  useQuery(FETCH_DESIGNER_SALES_BASIC, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const GET_ALL_USERS_SALARY_ITEMS = gql`
  query GET_ALL_USERS_SALARY_ITEMS($date: DateTime!, $input: UsersInput!) {
    users(input: $input) {
      users {
        id
        name
        designerNo
        increaseItem(date: $date)
        increaseItemDetail(date: $date) {
          itemName
          price
          type
        }
        decreaseItem(date: $date)
        decreaseItemDetail(date: $date) {
          itemName
          price
          type
        }
        isSalaryChecked(date: $date)
      }
    }
  }
`

export const useFetchUsersSalaryItems = ({ input, date }) =>
  useQuery(GET_ALL_USERS_SALARY_ITEMS, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_MERCHANT_DAILY_REPORT = gql`
  query FETCH_MERCHANT_DAILY_REPORT($input: UsersInput!, $date: DateTimeInput) {
    users(input: $input) {
      totalCount
      pageLimit
      pageOffset
      users {
        name
        salesAnalytics(input: $date) {
          customerTotalCount
          orderDesignateCount
          orderNonDesignateCount
          orderMaleCount
          orderFemaleCount
          orderUnknownCount
          customerAveragePriceWithProduct
          orderTotalCount
          orderAveragePriceWithProduct
        }
      }
    }
  }
`
export const useFetchMerchantDailyReport = ({ input, date }) =>
  useQuery(FETCH_MERCHANT_DAILY_REPORT, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const FETCH_DESIGNER_RAKE_REPORT = gql`
  query FETCH_DESIGNER_RAKE_REPORT($input: UsersInput!, $date: DateTimeInput) {
    users(input: $input) {
      totalCount
      pageLimit
      pageOffset
      users {
        name
        nickName
        id
        salesAnalytics(input: $date) {
          servicePerformanceFakeTotal
          servicePerformanceTruthTotal
          serviceThirdPartHandlingFeeOnSales
          servicePerformanceDecountItem
          servicePerformanceDecountHelperUsagePrice
          servicePerformanceDecountHelperUsagePoint
          servicePerformanceRake
          serviceThirdPartHandlingFeeOnSalary
          serviceSalaryDecountItem
          serviceSalaryDecountHelperUsagePrice
          serviceSalaryDecountHelperUsagePoint
          serviceSalaryShouldBePaid
          productPerformanceFakeTotal
          productThirdPartHandlingFee
          productPerformanceTruthTotal
          helperRetrievePrice
          helperRetrievePoint
          totalSalaryShouldBePaid
          ticketUsagePerformanceFakeTotal
          ticketThirdPartHandlingFeeOnSales
          ticketPerformanceDecountItem
          ticketUsagePerformanceTruthTotal
          ticketPerformanceRake
          ticketThirdPartHandlingFeeOnSalary
          ticketSalaryDecountItem
          ticketSalaryDecountHelperUsagePrice
          ticketSalaryDecountHelperUsagePoint
          ticketPerformanceDecountHelperUsage
          ticketPerformanceDecountHelperUsagePoint
          truthPerformanceWithoutHelper
          productRakeByFixed
          productRakeByCost
          productRakeByPrice
          walletDepositHandlingFeeByDesigner
        }
      }
    }
  }
`
export const useFetchDesignerRakeReport = ({ input, date }) =>
  useQuery(FETCH_DESIGNER_RAKE_REPORT, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const GET_USERS_IS_MONTH_CHECKOUT = gql`
  query GET_USERS_IS_MONTH_CHECKOUT($input: UsersInput!, $date: DateTime!) {
    users(input: $input) {
      users {
        id
        isSalaryChecked(date: $date)
      }
    }
  }
`

export function useFetchUsersMonthCheckout({ usagelimit, date }) {
  return useQuery(GET_USERS_IS_MONTH_CHECKOUT, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        usagelimit: usagelimit,
      },
      date: date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_USERS_BANK_INFO = gql`
  query GET_USERS_BANK_INFO($input: UsersInput!) {
    users(input: $input) {
      users {
        id
        name
        bankCode
        bankName
        bankBranchName
        bankAccount
      }
    }
  }
`

export function useFetchUsersBankInfo(input) {
  return useQuery(GET_USERS_BANK_INFO, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
const GET_USERS_IN_EMPLOYEE_SCHEDULE = gql`
  query GET_USERS_IN_EMPLOYEE_SCHEDULE($input: UsersInput!) {
    users(input: $input) {
      users {
        id
        nickName
        name
        designerNo
      }
    }
  }
`

export function useFetchUsersInEmployeeSchedule(input) {
  return useQuery(GET_USERS_IN_EMPLOYEE_SCHEDULE, {
    variables: {
      input: {
        MerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_USERS_IN_EMPLOYEE_LIST = gql`
  query GET_USERS_IN_EMPLOYEE_LIST($input: UsersInput!) {
    users(input: $input) {
      totalCount
      users {
        id
        avatar
        status
        lastName
        nickName
        cellphone
        firstName
        designerNo
        merchantIdentity {
          authorityName
        }
        isUserRakeSet
        deductionWay
        isDisplayOnBookingList
        isDisplayOnServiceList
        isDisplayOnPerformanceList
        isDisplayOnBookingRecord
      }
    }
  }
`

export function useFetchUsersInEmployeeList(input) {
  return useQuery(GET_USERS_IN_EMPLOYEE_LIST, {
    variables: {
      input
    },
    fetchPolicy: 'cache-and-network',
  })
}