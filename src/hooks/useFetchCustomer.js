import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_CUSTOMER_DETAIL = gql`
  query FETCH_CUSTOMER_DETAIL($id: ID) {
    customer(id: $id) {
      id
      no
      name
      gender
      email
      lineId
      nickName
      birthday {
        year
        month
        day
      }
      category
      cellphone
      address
      remark
      preferDesigner {
        id
        name
      }
      latestDesigner {
        id
        name
      }
      source
      membershipPurchaseRecord {
        expiryDay
        membershipName
        purchaseDate
        remark
        validityDay
      }
      isUnwelcome
      isLineBinded
      createdAt
    }
  }
`

export default function useFetchCustomer({ id }) {
  return useQuery(FETCH_CUSTOMER_DETAIL, {
    variables: {
      id,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchCustomerLazy() {
  const [getCustomerLazy, getCustomerLazyData] = useLazyQuery(FETCH_CUSTOMER_DETAIL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerLazy, getCustomerLazyData]
}

const FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL = gql`
  query FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL($id: ID) {
    customer(id: $id) {
      name
    }
  }
`

export function useFetchCustomerInOrderDetail({ id }) {
  return useQuery(FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL, {
    variables: {
      id,
    },
    fetchPolicy: 'cache-and-network',
  })
}
