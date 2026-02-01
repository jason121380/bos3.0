import { gql, useQuery } from '@apollo/client'
// 讀取全部會員卡
const FETCH_MEMBERSHIPS = gql`
  query FETCH_MEMBERSHIPS($input: MembershipsInput!) {
    memberships(input: $input) {
      data {
        uuid
        no
        name
        membershipCategory {
          id
          uuid
          name
        }
        cost
        sellPrice
        employeePrice
        isUsing
        updatedAt
        deletedAt
        creator {
          id
          name
        }
        commissionWay
        commission
        isAvailableForSale
        color
        effecitveDay
        isLocked
        textColor
        comment
        image
      }
      pageLimit
      pageOffset
      
    }
  }
`
export function useFetchGetMemberships(input) {
  return useQuery(FETCH_MEMBERSHIPS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
const FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE = gql`
  query FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE($input: MembershipsInput!) {
    memberships(input: $input) {
      data {
        uuid
        no
        name
        sellPrice
        effecitveDay
        isLocked
      }
    }
  }
`
export function useFetchGetMembershipsForAutocomplete(input) {
  return useQuery(FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
const FETCH_MEMBERSHIPS_FOR_MODAL = gql`
  query FETCH_MEMBERSHIPS_FOR_MODAL($input: MembershipsInput!) {
    memberships(input: $input) {
      pageLimit
      pageOffset
      data {
        uuid
        no
        name
        sellPrice
        effecitveDay
        isLocked
        membershipCategory {
          id
          uuid
          name
        }
      }
    }
  }
`
export function useFetchGetMembershipsForModal(input) {
  return useQuery(FETCH_MEMBERSHIPS_FOR_MODAL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

// 篩選會員卡
const FETCH_MEMBERSHIP = gql`
  query FETCH_MEMBERSHIP($membershipUUID: ID!) {
    membership(membershipUUID: $membershipUUID) {
      uuid
      no
      name
      membershipCategory {
        id
        uuid
        name
      }
      cost
      sellPrice
      employeePrice
      isUsing
      updatedAt
      deletedAt
      creator {
        id
        name
      }
      commissionWay
      commission
      isAvailableForSale
      color
      effecitveDay
      image
      textColor
      isLocked 
      comment
    }
  }
`
export function useFetchGetMembership(membershipUUID) {
  return useQuery(FETCH_MEMBERSHIP, {
    variables: {
      membershipUUID,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MEMBERSHIPS_IN_ORDER_DETAIL = gql`
  query GET_MEMBERSHIPS_IN_ORDER_DETAIL($input: MembershipsInput!) {
    memberships(input: $input) {
      data {
        uuid
        name
      }
    }
  }
`

export function useFetchMembershipsInOrderDetail(input = {}) {
  return useQuery(GET_MEMBERSHIPS_IN_ORDER_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_MEMBERSHIPS_FOR_TRANSFERLIST = gql`
  query FETCH_MEMBERSHIPS_FOR_TRANSFERLIST($input: MembershipsInput!) {
    memberships(input: $input) {
      data {
        uuid
        no
        name
        sellPrice
      }
    }
  }
`
export function useFetchGetMembershipsForTransferList(input) {
  return useQuery(FETCH_MEMBERSHIPS_FOR_TRANSFERLIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}