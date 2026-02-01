import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_USER_HELPER_RETRIEVE = gql`
  query GET_USER_HELPER_RETRIEVE($input: GetUserHelperRetrieveInput!) {
    getUserHelperRetrieve(input: $input) {
      helperRecord {
        date
        orderNo
        orderId
        helperPoint
        helperFeeNoPoint
        helperFeeOnlyPoint
        service {
          id
          name
          helperDeductionSetting {
            type
          }
        }
        designer {
          id
          name
          designerNo
          nickName
          nameForReport
        }
        helper {
          id
          name
          nickName
          designerNo
          deductionWay
        }
        helperDeductionType
        helperType
        helperMoneyGivenWay
        helperFee
      }
      productRecord {
        orderId
        orderNo
        seller {
          id
          designerNo
          name
          nickName
        }
        productName
        productUnitPrice
        productCount
        productRake
      }
      membershipRecord {
        orderId
        orderNo
        seller {
          id
          designerNo
          name
          nickName
        }
        productName
        productUnitPrice
        productCount
        productRake
      }
      summary
      pointSummary
      productPerformanceSummary
      productRakeSummary
      summaryNoPoint
      summaryOnlyPoint
      membershipPerformanceSummary
      membershipRakeSummary
    }
  }
`

export const useFetchUserHelperRetrieve = input =>
  useQuery(GET_USER_HELPER_RETRIEVE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })

export function useFetchUserHelperRetrieveLazy() {
  const [fetchUserHelperRetrieveLazy, userHelperRetrieveLazyData] = useLazyQuery(
    GET_USER_HELPER_RETRIEVE,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return { fetchUserHelperRetrieveLazy, userHelperRetrieveLazyData }
}
