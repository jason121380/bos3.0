import { gql, useQuery } from '@apollo/client'

const GET_NON_CASH_DETAIL_STATEMENT = gql`
  query GET_NON_CASH_DETAIL_STATEMENT($input: NonCashDetailStatementInput!) {
    nonCashDetailStatement(input: $input) {
      nonCashDetailStatement {
        date
        orderNo
        serialNumber
        customerName
        designerNo
        designerName
        otherPay {
          name
          price
          handlingFee
        }
        thirdPartTicket {
          name
          price
          handlingFee
        }
        walletUsed
        bonusDecount
      }
      summary {
        orderCount
        walletUsed
        bonusDecount
      }
      thirdPartTicketUsing
      otherPayUsing
    }
  }
`

export default function useFetchNonCashDetailStatement({ input }) {
  return useQuery(GET_NON_CASH_DETAIL_STATEMENT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
