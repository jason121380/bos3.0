import { useQuery } from '@apollo/client'
import { gql } from 'apollo-boost'

const GET_USING_ORDER_QUEUE = gql`
  query GET_USING_ORDER_QUEUE {
    getUsingOrderQueue {
      id
      orderInput
      orderNo
      orderDate
      status
      createTime
      message
    }
  }
`

const useFetchGetUsingOrderQueue = () => {
  return useQuery(GET_USING_ORDER_QUEUE, {
    fetchPolicy: 'cache-and-network',
  })
}

export default useFetchGetUsingOrderQueue
