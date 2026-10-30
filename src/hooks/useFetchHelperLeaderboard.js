import { gql, useQuery } from '@apollo/client'

const FETCH_HELPER_LEADERBOARD = gql`
  query FETCH_HELPER_LEADERBOARD($input: HelperLeaderboardInput!) {
    helperLeaderboard(input: $input) {
      userName
      storeName
      productTotal
      helperReceivedPoint
      helperReceivedPrice
      membershipTotal
      mergedDetails {
        storeName
        productTotal
        helperReceivedPoint
        helperReceivedPrice
        membershipTotal
      }
    }
  }
`
export default function useFetchHelperLeaderboard(input) {
  return useQuery(FETCH_HELPER_LEADERBOARD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
