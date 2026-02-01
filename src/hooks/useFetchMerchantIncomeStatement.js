import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_INCOME_STATEMENT = gql`
  query GET_MERCHANT_INCOME_STATEMENT($date: DateTime!) {
    merchantIncomeStatement(date: $date) {
      businessIncomeDetail {
        serviceConsumption
        productConsumption
        ticketConsumption
        paidByCash
        paidByWallet
        paidByOtherWay
        paidByOtherWayDetail {
          payTypeName
          payTypeUsage
          payTypeHandlingFee
        }
        ticketDetail {
          balanceAtStartOfMonth
          ticketDeposit
          ticketHandlingFee
          ticketUsage
        }
        walletDetail {
          balanceAtStartOfMonth
          walletDeposit
          walletHandlingFee
          walletUsage
        }
        moneyFlowSetConnection {
          amount
          inoutType
          accountingSubject {
            id
            name
          }
        }
      }
    }
  }
`

export default function useFetchMerchantIncomeStatement({ date }) {
  return useQuery(GET_MERCHANT_INCOME_STATEMENT, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_REPORT_FOR_DAILY_REPORT = gql`
  query GET_MERCHANT_REPORT_FOR_DAILY_REPORT($date: DateTime!) {
    merchantIncomeStatement(date: $date) {
      businessIncomeDetail {
        serviceConsumption
        productConsumption
        ticketConsumption
        paidByCash
        paidByOtherWay
        ticketDetail {
          ticketDeposit
        }
        walletDetail {
          walletDeposit
        }
      }
    }
  }
`

export function useFetchMerchantReportForDailyReport({ date }) {
  return useQuery(GET_MERCHANT_REPORT_FOR_DAILY_REPORT, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
