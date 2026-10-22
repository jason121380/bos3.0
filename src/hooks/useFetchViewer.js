import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_DESIGNER = gql`
  query($input: AnonymousDesignerInput!) {
    viewer {
      anonymous {
        designers(input: $input) {
          totalCount
          data {
            id
            name
            nickName
          }
        }
      }
    }
  }
`

export default function useFetchViewer(input) {
  return useQuery(FETCH_DESIGNER, {
    variables: {
      input: {
        showAll: true,
        ...input,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}

const CUSTOMER_BOOKING_RESULTS = gql`
  query($input: OrdersInput!) {
    viewer {
      customer {
        id
        orders(input: $input) {
          orders {
            id
            date
            status
            isReserved
            isDesignate
            designer {
              id
              name
            }
          }
        }
      }
    }
  }
`
const CUSTOMER_PROFILE = gql`
  {
    viewer {
      customer {
        id
        no
        name
        cellphone
        gender
        type
      }
    }
  }
`

export const useFetchCustomerBookingResults = input => {
  return useQuery(CUSTOMER_BOOKING_RESULTS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useLazyFetchCustomerProfile = input => {
  const [fetchCustomerProfile, customerProfile] = useLazyQuery(CUSTOMER_PROFILE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchCustomerProfile,
    customerProfile,
  }
}

export const useFetchMerchantLiff = ({ merchantId }) =>
  useQuery(FETCH_MERCHANT_LIFF, {
    fetchPolicy: 'cache-and-network',
    variables: {
      merchantId,
    },
  })

const FETCH_MERCHANT_LIFF = gql`
  query($merchantId: ID!) {
    viewer {
      anonymous {
        merchant(id: $merchantId) {
          id
          reservationLiff
        }
      }
    }
  }
`
