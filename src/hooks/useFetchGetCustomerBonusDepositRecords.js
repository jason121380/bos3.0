import { gql, useQuery } from '@apollo/client'

export const GET_CUSTOMER_BONUS_DEPOSIT_RECORDS = gql`
  query GET_CUSTOMER_BONUS_DEPOSIT_RECORDS {
    customerBonusDepositRecords {
      id
      customerName
      customerNo
      date
      bonus
      designerName
      remark
    }
  }
`

export default function useFetchGetCustomerBonusDepositRecords() {
  return useQuery(GET_CUSTOMER_BONUS_DEPOSIT_RECORDS, {
    fetchPolicy: 'cache-and-network',
  })
}

export const GET_CUSTOMER_BONUS_DEPOSIT_RECORD = gql`
  query GET_CUSTOMER_BONUS_DEPOSIT_RECORD($bonusId: ID!) {
    customerBonusDepositRecord (bonusId: $bonusId) {
      customerId
      date
      bonus
      designerId
      remark
    }
  }
`

export function useFetchGetCustomerBonusDepositRecord({ bonusId }) {
  return useQuery(GET_CUSTOMER_BONUS_DEPOSIT_RECORD, {
    variables: {
      bonusId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
