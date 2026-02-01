import { gql, useQuery } from '@apollo/client'

const GET_SERVICES = gql`
  query FETCH_SERVICES($input: ServicesInput!) {
    services(input: $input) {
      totalCount
      pageOffset
      pageLimit
      data {
        id
        no
        name
        price
        isUsing
        serviceDeductionCount
        helperDeductionCount
        serviceCategory {
          id
          name
        }
        helperDeductionSetting {
          type
          nameList
        }
        bindedThirdPartTicket {
          id
        }
        isBindedThirdPartTicketLocked
        updatedAt
        isLocked
        isNoCash
      }
    }
  }
`

export default function useFetchServices(input = {}) {
  return useQuery(GET_SERVICES, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_SERVICES_FOR_AUTOCOMPLETE = gql`
  query GET_SERVICES_FOR_AUTOCOMPLETE($input: ServicesInput!) {
    services(input: $input) {
      totalCount
      pageOffset
      pageLimit
      data {
        id
        no
        name
        price
        isLocked
        isNoCash
        bindedThirdPartTicket {
          id
        }
        isBindedThirdPartTicketLocked
      }
    }
  }
`

export function useFetchServicesForAutoComplete(input = {}) {
  return useQuery(GET_SERVICES_FOR_AUTOCOMPLETE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_SERVICES_IN_ORDER_DETAIL = gql`
  query GET_SERVICES_IN_ORDER_DETAIL($input: ServicesInput!) {
    services(input: $input) {
      data {
        id
        name
      }
    }
  }
`

export function useFetchServicesInOrderDetail(input = {}) {
  return useQuery(GET_SERVICES_IN_ORDER_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_SERVICES_FOR_TRANSFERLIST = gql`
  query GET_SERVICES_FOR_TRANSFERLIST($input: ServicesInput!) {
    services(input: $input) {
      data {
        id
        no
        name
        price
      }
    }
  }
`

export function useFetchServicesForTransferList(input = {}) {
  return useQuery(GET_SERVICES_FOR_TRANSFERLIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
