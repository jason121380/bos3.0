import { gql, useQuery } from '@apollo/client'

const FETCH_DESIGNERS = gql`
  query FETCH_DESIGNERS($merchantId: ID!) {
    merchantDesigners(merchantId: $merchantId) {
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
      merchants {
        id
        name
      }
      jobTitle
      designerNo
      salesSetting {
        salesWay
        helperDeductionWay
        isDivided
        isAllInterVal
        employeeSalesIntervals {
          comparisonWay
          intervals {
            down
            top
            percent
          }
        }
      }
    }
  }
`

export default function useFetchMerchantDesigners() {
  return useQuery(FETCH_DESIGNERS, {
    variables: {
      merchantId: localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null,
    },
    fetchPolicy: 'cache-and-network',
  })
}
