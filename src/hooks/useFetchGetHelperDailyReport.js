import { gql, useQuery } from '@apollo/client'

const GET_HELPER_DAILY_REPORT = gql`
  query GET_HELPER_DAILY_REPORT($input: HelperDailyReportInput!) {
    helperDailyReport(input: $input) {
      user {
        id
        name
        nickName
        designerNo
      }
      helperRecord {
        orderId
        orderNo
        isDesignate
        itemName
        designer {
          nameForReport
        }
        price
        point
      }
      helperRecordPriceSummary
      helperRecordPointSummary
      summaryCurrentDay {
        priceRetrieveWithoutPoint
        priceRetrieveFromPoint
        point
        productPerformance
        productRake
        membershipPerformance
        membershipRake
      }
      summaryTillNow {
        priceRetrieveWithoutPoint
        priceRetrieveFromPoint
        point
        productPerformance
        productRake
        membershipPerformance
        membershipRake
      }
    }
  }
`

const useFetchGetHelperDailyReport = ({input}) =>
  useQuery(GET_HELPER_DAILY_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
export default useFetchGetHelperDailyReport