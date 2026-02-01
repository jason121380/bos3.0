import { gql, useMutation } from '@apollo/client'

const DESTROY_CHECKOUT_RECORD = gql`
  mutation DESTROY_CHECKOUT_RECORD($userIds: [ID]!, $date: DateTime!) {
    destroyUserSalaryMonthlyCheckoutRecord(userIds: $userIds, date: $date)
  }
`

export default function useFetchDestroyUserSalaryMonthlyCheckoutRecord() {
  const [destroyUserSalaryMonthlyCheckoutRecord] = useMutation(DESTROY_CHECKOUT_RECORD)
  return {
    destroyUserSalaryMonthlyCheckoutRecord: ({ date, userIds }) =>
      destroyUserSalaryMonthlyCheckoutRecord({
        variables: {
          date,
          userIds,
        },
      }),
  }
}
