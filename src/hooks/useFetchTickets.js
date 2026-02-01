import { gql, useQuery } from '@apollo/client'
import idx from 'idx'

const GET_TICKETS = gql`
  query GET_TICKETS($keyword: String, $categoryIds: [ID], $isLaunched: Boolean, $orderId: ID), {
    tickets(keyword: $keyword, categoryIds: $categoryIds, isLaunched: $isLaunched, orderId: $orderId) {
      id
      no
      name
      price
      ticketAvailableCount
      isTicketCountNow
      updatedAt
      isUsing
      remark
      ticketDeductionCount
      helperDeductionCount
      creator {
        id
        name
      }
      isLocked
      ServiceCategory {
        name
      }
      performanceCalculationMode
    }
  }
`

export default function useFetchTickets(setting = {}) {
  const { data, error, loading, called, refetch } = useQuery(GET_TICKETS, {
    variables: {
      keyword: idx(setting, _ => _.keyword || ''),
      categoryIds: idx(setting, _ => _.categoryIds || []),
      isLaunched: setting.isLaunched || undefined,
      orderId: setting.orderId || undefined
    },
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, called, refetch }
}
const GET_TICKETS_IN_ORDER_DETAIL = gql`
  query GET_TICKETS_IN_ORDER_DETAIL($keyword: String, $categoryIds: [ID]) {
    tickets(keyword: $keyword, categoryIds: $categoryIds) {
      id
      name
    }
  }
`

export function useFetchTicketsInOrderDetail(setting) {
  const { data, error, loading, called, refetch } = useQuery(GET_TICKETS_IN_ORDER_DETAIL, {
    variables: {
      keyword: idx(setting, _ => _.keyword || ''),
      categoryIds: idx(setting, _ => _.categoryIds || []),
    },
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, called, refetch }
}

const GET_TICKETS_FOR_LIST = gql`
  query GET_TICKETS_FOR_LIST($keyword: String, $categoryIds: [ID]) {
    ticketsForList(keyword: $keyword, categoryIds: $categoryIds) {
      id
      no
      name
      price
      ticketAvailableCount
      isTicketCountNow
      updatedAt
      isUsing
      remark
      ticketDeductionCount
      helperDeductionCount
      creator {
        id
        name
      }
      isLocked
      ServiceCategory {
        name
      }
      performanceCalculationMode
      isLaunched
    }
  }
`

export function useFetchTicketsForList(setting) {
  const { data, error, loading, called, refetch } = useQuery(GET_TICKETS_FOR_LIST, {
    variables: {
      keyword: idx(setting, _ => _.keyword || ''),
      categoryIds: idx(setting, _ => _.categoryIds || []),
    },
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, called, refetch }
}

const GET_TICKETS_FOR_AUTOCOMPLETE = gql`
  query GET_TICKETS_FOR_AUTOCOMPLETE {
    ticketsForList {
      id
      no
      name
    }
  }
`
export function useFetchTicketsForAutocomplete() {
  return useQuery(GET_TICKETS_FOR_AUTOCOMPLETE, {
    variables: {},
    fetchPolicy: 'cache-and-network',
  })
}

const GET_TICKETS_FOR_TRANSFERLIST = gql`
  query GET_TICKETS_FOR_TRANSFERLIST($keyword: String, $categoryIds: [ID], $isLaunched: Boolean, $orderId: ID), {
    tickets(keyword: $keyword, categoryIds: $categoryIds, isLaunched: $isLaunched, orderId: $orderId) {
      id
      no
      name
      price
    }
  }
`

export function useFetchTicketsForTransferList(setting = {}) {
  const { data, error, loading, called, refetch } = useQuery(GET_TICKETS_FOR_TRANSFERLIST, {
    variables: {
      keyword: idx(setting, _ => _.keyword || ''),
      categoryIds: idx(setting, _ => _.categoryIds || []),
      isLaunched: setting.isLaunched || undefined,
      orderId: setting.orderId || undefined
    },
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, called, refetch }
}
