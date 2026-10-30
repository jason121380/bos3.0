import { gql, useQuery } from '@apollo/client'

const GET_HELPER_PERFORMANCE = gql`
  query GET_HELPER_PERFORMANCE($input: DateTimeInput!, $jobTitle: [ID]) {
    helperPerformanceReport(input: $input, jobTitle: $jobTitle) {
      userNo
      userName
      helperPerformance {
        typeName
        count
        designateCount
        priceNoPoint
        point
      }
    }
  }
`

export const useFetchGetHelperPerformance = ({ input, jobTitle }) =>
  useQuery(GET_HELPER_PERFORMANCE, {
    variables: {
      input,
      jobTitle,
    },
    fetchPolicy: 'cache-and-network',
  })
