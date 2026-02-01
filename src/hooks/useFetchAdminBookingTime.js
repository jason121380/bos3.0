import { gql, useMutation } from '@apollo/client'

const ADMIN_BOOKING_TIME = gql`
  mutation adminBookingTime($input: AdminBookingTimeInput!) {
    adminBookingTime(input: $input) {
      designerId
      storeId
      status
    }
  }
`

export default function useFetchAdminBookingTime() {
  const [adminBookingTime] = useMutation(ADMIN_BOOKING_TIME)
  return {
    adminBookingTime: input =>
      adminBookingTime({
        variables: {
          input,
        },
      }),
  }
}

const ADMIN_BOOKING_TIME_ALL_STORE = gql`
  mutation adminBookingTimeAllStore($input: AdminBookingTimeAllStoreInput) {
    adminBookingTimeAllStore(input: $input) {
      designerId
      storeId
      status
      time
    }
  }
`
export function useFetchAdminBookingTimeAllStore() {
  const [adminBookingTimeAllStore] = useMutation(ADMIN_BOOKING_TIME_ALL_STORE)
  return {
    adminBookingTimeAllStore: input =>
      adminBookingTimeAllStore({
        variables: {
          input,
        },
      }),
  }
}