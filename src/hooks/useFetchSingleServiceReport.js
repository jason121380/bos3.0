import { gql, useQuery } from '@apollo/client'

const GET_SINGLE_SERVICE = gql`
  query GET_SINGLE_SERVICE($input: SingleServiceItemInput!) {
    singleServiceItem(input: $input) {
      singleServiceItem {
        date
        serviceName
        performance
        orderCount
        designerName
        designerNo
      }
    }
  }
`

export default function useFetchSingleServiceReport(input) {
  return useQuery(GET_SINGLE_SERVICE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
