import { gql, useMutation } from '@apollo/client'

const SET_INVITE_RATING_DAY_COUNT = gql`
  mutation SET_INVITE_RATING_DAY_COUNT($input: Int) {
    setInviteRatingDayCount(input: $input)
  }
`

export default function useFetchSetInviteRatingDayCount() {
  const [setInviteRatingDayCount] = useMutation(SET_INVITE_RATING_DAY_COUNT)
  return {
    setInviteRatingDayCount: ({ input }) =>
      setInviteRatingDayCount({
        variables: {
          input,
        },
      }),
  }
}