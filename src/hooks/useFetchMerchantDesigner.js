import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER = gql`
  query DESIGNER($designerId: ID) {
    merchantDesigner(designerId: $designerId) {
      id
      cellphone
      uid
      userCode
      status
      isNeedChangePassword
      firstName
      lastName
      name
      nickName
      gender
      avatar
      email
      serialNumber
      birthday
      contactAddress
      address
      groupCategory
      userGroup
      identity
      remark
      lineAccountId
      isLineBinded
      deductionWay
      isBookingAutoAccept
      isRTCO
      merchantIdentity {
        authorityName
        authorityId
      }
      isDisplayOnBookingList
      isDisplayOnServiceList
      isDisplayOnPerformanceList
      isDisplayOnSalaryReportList
      isDisplayOnClockInReportList
      isDisplayOnBookingRecord
      insuranceGrade
      insuranceDeductible
      bankCode
      bankName
      bankBranchName
      bankAccount
      familyMemberName
      familyMemberRelation
      familyMemberPhone
      familyMemberAddress
      userRake {
        userId
        isSegmented
        nonSegmented {
          attribute
          rakeData {
            designate {
              rake
              threshold
            }
            nonDesignate {
              rake
              threshold
            }
            nonDistinguish {
              rake
              threshold
            }
          }
        }
        segmented {
          designate {
            rake
            thresholdLowerLimit
            thresholdUpperLimit
          }
          nonDesignate {
            rake
            thresholdLowerLimit
            thresholdUpperLimit
          }
          nonDistinguish {
            rake
            thresholdLowerLimit
            thresholdUpperLimit
          }
        }
      }
      merchants {
        id
        name
      }
      jobTitle
      designerNo
      status
      userCategory {
        id
      }
      bookingLimit
      isCellphoneLogin
      selfIntroduction
      selfIntroductionLink
      employmentStartDate
    }
  }
`

export default function useFetchMerchantDesigner({ designerId }) {
  return useQuery(FETCH_DESIGNER, {
    variables: {
      designerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_DESIGNER_FIXED_SALARY_ITEMS = gql`
  query FETCH_DESIGNER_FIXED_SALARY_ITEMS($designerId: ID) {
    merchantDesigner(designerId: $designerId) {
      fixedSalaryItem {
        increaseItem {
          itemName
          price
        }
        decreaseItem {
          itemName
          price
        }
      }
    }
  }
`

export function useFetcDesignerFixedSalaryItemsLazy() {
  const [fetcDesignerFixedSalaryItemsLazy, designerFixedSalaryItemsLazyData] = useLazyQuery(FETCH_DESIGNER_FIXED_SALARY_ITEMS, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetcDesignerFixedSalaryItemsLazy, designerFixedSalaryItemsLazyData }
}
const FETCH_DESIGNER_IN_ORDER_DETAIL = gql`
  query FETCH_DESIGNER_IN_ORDER_DETAIL($designerId: ID) {
    merchantDesigner(designerId: $designerId) {
      name
      nickName
    }
  }
`

export function useFetcDesignerInOrderDetail({ designerId }) {
  return useQuery(FETCH_DESIGNER_IN_ORDER_DETAIL, {
    variables: {
      designerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
