import { gql, useMutation } from '@apollo/client'

const FETCH_RATING = gql`
  mutation Rating($input: OrderRatingInput!) {
    orderRating(input: $input)
  }
`

export default function useFetchRating() {
  const [fetchRating] = useMutation(FETCH_RATING)
  return {
    fetchRating: input =>
      fetchRating({
        variables: {
          input,
        },
      }),
  }
}
