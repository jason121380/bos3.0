import { gql, useMutation } from '@apollo/client'

const SET_CUS_RATING_DAY_COUNT = gql`
  mutation SET_CUS_RATING_DAY_COUNT($input: Int) {
    setCusRatingDayLimit(input: $input)
  }
`

export default function useFetchSetCusRatingDayLimit() {
  const [setCusRatingDayLimit] = useMutation(SET_CUS_RATING_DAY_COUNT)
  return {
    setCusRatingDayLimit: ({ input }) =>
      setCusRatingDayLimit({
        variables: {
          input,
        },
      }),
  }
}