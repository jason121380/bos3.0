import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_SMS_RECORD = gql`
  query GET_CUSTOMER_SMS_RECORD($input: CustomerSMSRecordInput!) {
    customerSMSRecord(input: $input) {
      date
      cellphone
      message
    }
  }
`

export default function useFetchGetCustomerSMSRecord({ input }) {
  return useQuery(GET_CUSTOMER_SMS_RECORD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}