import { gql, useQuery } from '@apollo/client'

const FETCH_ENTIRE_TICKET_RECORDS = gql`
  query FETCH_ENTIRE_TICKET_RECORDS($input: TicketRecordReportInput!) {
    entireTicketRecords(input: $input) {
      data {
        id
        price
        name
        pricePerCount
        no
        helperList {
          helper {
            id
            name
          }
        }
        order {
          id
          date
          no
          customer {
            id
            name
            cellphone
          }
          designer {
            id
            name
            designerNo
          }
        }
        service {
          id
          name
          price
          no
          helperDeductionSetting {
            type
            nameList
          }
        }
        usageOrder {
          no
          id
        }
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchEntireTicketRecords(input) {
  return useQuery(FETCH_ENTIRE_TICKET_RECORDS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
