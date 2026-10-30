import { gql, useQuery } from '@apollo/client'

const GET_SERVICES_AND_TICKETS = gql`
  query GET_SERVICES_AND_TICKETS{
    getServiecAndTicketList{
      id
      no
      name
      price
    }
  }
`

export default function useFetchServiceAndTicketList() {
  return useQuery(GET_SERVICES_AND_TICKETS, {
    fetchPolicy: 'cache-and-network',
  })
}
