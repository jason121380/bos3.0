import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_USER_MERCHANTS = gql`
  query GET_USER_MERCHANTS {
    getUserMerchant 
  }
`

// skip：版面以 useAfterFirstLoad 延後到首屏完成後再查（lib/after-first-load）；其他元件不帶參數，行為不變
export default function useFetchGetUserMerchant({ skip = false } = {}) {
  return useQuery(GET_USER_MERCHANTS, {
    fetchPolicy: 'cache-and-network',
    skip,
  })
}

const GET_USER_MERCHANTS_FOR_MANAGEMENT = gql`
  query GET_USER_MERCHANTS_FOR_MANAGEMENT {
    advancedManagerMerchants
  }
`

export function useFetchGetUserMerchantForManagementLazy() {
  const [merchantForManagement, merchantForManagementData] = useLazyQuery(GET_USER_MERCHANTS_FOR_MANAGEMENT, {
    fetchPolicy: 'cache-and-network',
  })
  return [merchantForManagement, merchantForManagementData]
}

const GET_EVENT_JOIN_MERCHANTS = gql`
  query GET_EVENT_JOIN_MERCHANTS($eventId: ID!) {
    eventJoinedMerchants(eventId: $eventId)
  }
`

export function useFetchGetEventJoinMerchants() {
  const [eventJoinMerchants, eventJoinMerchantsData] = useLazyQuery(GET_EVENT_JOIN_MERCHANTS, {
    fetchPolicy: 'cache-and-network',
  })
  return [eventJoinMerchants, eventJoinMerchantsData]
}

const GET_USER_GROUPS_WOCS = gql`
  query GET_USER_GROUPS_WOCS {
    getUserGroupWOCS
  }
`

export function useFetchGetUserGroupsWOCS() {
  return useQuery(GET_USER_GROUPS_WOCS, {
    fetchPolicy: 'cache-and-network',
  })
}
