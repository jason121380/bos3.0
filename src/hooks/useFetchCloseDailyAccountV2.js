import { gql, useMutation } from '@apollo/client'

const FETCH_CLOSE_DAILY_ACCOUNTV2 = gql`
  mutation closeDailyAccountV2($input: CloseDailyAccountInput!) {
    closeDailyAccountV2(input: $input)
  }
`

export default function useFetchCloseDailyAccountV2() {
  const [closeDailyAccountV2] = useMutation(FETCH_CLOSE_DAILY_ACCOUNTV2)
  return {
    closeDailyAccountV2: input =>
      closeDailyAccountV2({
        variables: {
          input,
        },
      }),
  }
}
