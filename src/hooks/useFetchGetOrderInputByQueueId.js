import {
 useQuery
} from '@apollo/client'
import {
  gql
} from 'apollo-boost'

const GET_ORDER_INPUT_BY_QUEUE_ID = gql `
  query GET_ORDER_INPUT_BY_QUEUE_ID ($queueId:  String!) {
    getOrderInputByQueueId(queueId: $queueId)
  }
`

export default function useFetchGetOrderInputByQueueId(queueId) {
  return useQuery(GET_ORDER_INPUT_BY_QUEUE_ID, {
    variables: {
      queueId,
    },
    fetchPolicy: 'cache-and-network',
  })
}