import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_DATA_MARKED = gql`
query getCustomerSidePageDisplay {
  getCustomerSidePageDisplay {
    ServiceRecord
    TicketRecord
    WalletRecord
    BonusRecord
    CustomerMall
  }
}
`

export default function useFetchGetCustomerSidePageDisplay() {
  return useQuery(GET_CUSTOMER_DATA_MARKED, {
    fetchPolicy: 'cache-and-network',
  })
}