import { gql, useLazyQuery } from '@apollo/client'

const FETCH_USED_TICKET_RECORDS = gql`
  query FETCH_USED_TICKET_RECORDS($input: TicketRecordReportInput!, $ticketIds: [ID]) {
    usedTicketRecords(input: $input, ticketIds: $ticketIds) {
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
          date
          designer {
            id
            name
            designerNo
          }
        }
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export function useFetchUsedTicketRecordsLazy(input, ticketIds) {
  const [getUsedTicketRecords, usedTicketRecordsData] = useLazyQuery(FETCH_USED_TICKET_RECORDS, {
    variables: {
      input,
      ticketIds,
    },
    fetchPolicy: 'cache-and-network',
  })
  return [getUsedTicketRecords, usedTicketRecordsData]
}
