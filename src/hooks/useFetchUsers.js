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