import { gql, useQuery } from '@apollo/client'

export const GET_DESIGNERS_CALENDER = gql`
  query GET_DESIGNERS_CALENDER($input: DateTimeInput!) {
    getDesignersCalendar(input: $input) {
      designerId
      designerCalendar {
        type
        startTime
        timeCost
        nameToDisplay
      }
    }
  }
`

export default function useFetchGetDesignersCalendar({ input }) {
  return useQuery(GET_DESIGNERS_CALENDER, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
