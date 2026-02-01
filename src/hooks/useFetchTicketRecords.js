import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_TICKET_RECORDS = gql`
  query GetTicket($input: TicketRecordInput!) {
    ticketRecords(input: $input) {
      data {
        id
        price
        name
        pricePerCount
        no
        remark
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
            helperDeductionType
          }
        }
        usageOrder {
          no
          id
          date
        }
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchTicketRecords(input) {
  return useQuery(FETCH_TICKET_RECORDS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useFetchLazyTicketRecords = () => {
  const [fetchTicketRecod, response] = useLazyQuery(FETCH_TICKET_RECORDS)
  return {
    fetchTicketRecod: input =>
      fetchTicketRecod({
        variables: {
          input,
        },
        fetchPolicy: 'cache-and-network',
      }),
    response,
  }
}

const FETCH_TICKET_RECORDS_IN_ORDER_DETAIL = gql`
  query GetTicket($input: TicketRecordInput!) {
    ticketRecords(input: $input) {
      data {
        id
        price
        name
      }
    }
  }
`

export function useFetchTicketRecordsInOrderDetail(input) {
  return useQuery(FETCH_TICKET_RECORDS_IN_ORDER_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
