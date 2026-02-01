import { gql, useMutation } from '@apollo/client'

const FETCH_SET_USER_DISPLAY_SITIUATION = gql`
  mutation FETCH_SET_USER_DISPLAY_SITIUATION($input: SetUserDisplaySituationInput) {
    setUserDisplaySituation(input: $input) {
      designerId
      isDisplayOnBookingList
      isDisplayOnServiceList
    }
  }
`

export default function useFetchSetUserDisplaySituation() {
  const [setUserDisplaySituation] = useMutation(FETCH_SET_USER_DISPLAY_SITIUATION)
  return {
    setUserDisplaySituation: ({ input }) =>
      setUserDisplaySituation({
        variables: {
          input,
        },
      }),
  }
}
