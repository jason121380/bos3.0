import { useLazyQuery } from '@apollo/client'
import { gql } from 'apollo-boost'

const FETCH_ORDER_EXCEL = gql`
  query orderExcel($input: ReportInput!) {
    orderExcel(input: $input)
  }
`

const useFetchOrderExcel = ({ input }) => {
  const [fetchOrderExcel, response] = useLazyQuery(FETCH_ORDER_EXCEL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return { fetchOrderExcel, response }
}

export default useFetchOrderExcel
