import { gql, useQuery } from '@apollo/client'

const GET_MONEY_FLOW = gql`
  query GET_MONEY_FLOW($id: ID!) {
    moneyFlow(id: $id) {
      id
      date
      accountingSubject {
        id
        name
        number
        inoutType
      }
      amount
      inoutType
      user {
        id
        name
        designerNo
      }
      walletType
      remark
      relationUser {
        name
        id
        designerNo
      }
    }
  }
`

export default function useFetchGetMoneyFlow({ id }) {
  return useQuery(GET_MONEY_FLOW, {
    variables: {
      id,
    },
    fetchPolicy: 'cache-and-network',
  })
}
