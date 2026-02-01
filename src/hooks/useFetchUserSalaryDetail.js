import { gql, useQuery } from '@apollo/client'

const FETCH_DESIGNERS_SALARY_DETAIL = gql`
  query FETCH_DESIGNERS_SALARY_DETAIL($date: DateTime) {
    getUserSalaryDetail(date: $date) {
      userSalaryDetail {
        userName
        userNo
        userHelperIdentity
        bankDetail {
          bankCode
          bankName
          bankBranchName
          bankAccount
        }
        increase {
          itemName
          price
        }
        increaseSum
        decrease {
          itemName
          price
        }
        decreaseSum
        actualPaidPrice
        designatePerformance
        nonDesignatePerformance
        helperRetrievePoint
        specialTruthPerformance
      }
      usingSalaryIncreaseItem {
        order
        name
      }
      usingSalaryDecreaseItem {
        order
        name
      }
    }
  }
`
export default function useFetchDesignersSalaryDetailReport({ date }) {
  return useQuery(FETCH_DESIGNERS_SALARY_DETAIL, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
