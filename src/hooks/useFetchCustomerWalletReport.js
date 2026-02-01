import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_WALLET_BALANCE = gql`
  query GET_CUSTOMER_WALLET_BALANCE($input: CustomerWalletReportInput) {
    customerWalletReport(input: $input) {
      customerWalletReport {
        customerId
        customerName
        customerNickName
        customerNo
        leftWallet
        preferDesignerName
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchCustomerWalletBalance({ input }) {
  return useQuery(GET_CUSTOMER_WALLET_BALANCE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
