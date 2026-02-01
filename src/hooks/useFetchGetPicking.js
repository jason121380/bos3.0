import { gql, useQuery } from '@apollo/client'

const FETCH_GET_PICKING = gql`
  query FETCH_GET_PICKING($input: ID!) {
    picking(id: $input) {
      id
      date
      productName
      productNo
      price
      count
      total
      purpose
      remark
      Picker {
        id
        name
        designerNo
      }
    }
  }
`

export default function useFetchGetPicking(input) {
  return useQuery(FETCH_GET_PICKING, {
    variables: {
      input
    },
    fetchPolicy: 'cache-and-network',
  })
}
