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

export const useLazyFetchCustomerBookingResults = input => {
  const [fetchCustomerBookingResults, customerBookingResults] = useLazyQuery(
    CUSTOMER_BOOKING_RESULTS,
    {
      variables: {
        input,
      },
      fetchPolicy: 'cache-and-network',
    }
  )
  return {
    fetchCustomerBookingResults,
    customerBookingResults,
  }
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

const FETCH_CUSTOMER_VIEWER_SERVICE_CATEGORY = gql`
  query($merchantId: ID!, $input: AvailableBookingTimeInput) {
    viewer {
      anonymous {
        merchant(id: $merchantId) {
          id
          bookingCategories {
            id
            name
          }
          availableBookingTime(input: $input) {
            time
          }
        }
      }
    }
  }
`

export const useLazyFetchViewServicecategory = ({ merchantId, input }) => {
  const [fetchViewServicecategory, bookingCategories] = useLazyQuery(
    FETCH_CUSTOMER_VIEWER_SERVICE_CATEGORY,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        merchantId,
        input,
      },
    }
  )
  return {
    fetchViewServicecategory,
    bookingCategories,
  }
}

const CUSTOMIZE_MERCHANT_GROUP = gql`
  {
    viewer {
      admin {
        customizeMerchantGroup {
          id
          name
          merchants {
            id
            name
          }
        }
      }
    }
  }
`

export const useFetchCustomizeMerchantGroup = function () {
  return useQuery(CUSTOMIZE_MERCHANT_GROUP, {
    fetchPolicy: 'cache-and-network',
  })
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
