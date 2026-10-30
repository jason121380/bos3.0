import { gql, useQuery, useLazyQuery } from '@apollo/client'

export const GET_CUSTOMER_BONUS_RECORD = gql`
  query GET_CUSTOMER_BONUS_RECORD($customerId: ID!) {
    customerBonusRecord (customerId: $customerId) {
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

export default function useFetchGetCustomerBonusRecord({ customerId }) {
  return useQuery(GET_CUSTOMER_BONUS_RECORD, {
    variables: {
      customerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const GET_CUSTOMER_BONUS_RECORD_LAZY = gql`
  query GET_CUSTOMER_BONUS_RECORD($customerId: ID!) {
    customerBonusRecord (customerId: $customerId) {
      bonus
    }
  }
`

export function useFetchGetCustomerBonusRecordLazy() {
  const [getCustomerBonusRecord, customerBonusRecordData] = useLazyQuery(GET_CUSTOMER_BONUS_RECORD_LAZY, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerBonusRecord, customerBonusRecordData]
}
