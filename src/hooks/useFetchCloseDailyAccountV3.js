import { gql, useMutation } from '@apollo/client'

const FETCH_CLOSE_DAILY_ACCOUNTV3 = gql`
  mutation closeDailyAccountV3($input: CloseDailyAccountInput!) {
    closeDailyAccountV3(input: $input)
  }
`

export default function useFetchCloseDailyAccountV3() {
  const [closeDailyAccountV3] = useMutation(FETCH_CLOSE_DAILY_ACCOUNTV3)
  return {
    closeDailyAccountV3: input =>
      closeDailyAccountV3({
        variables: {
          input,
        },
      }),
  }
}
