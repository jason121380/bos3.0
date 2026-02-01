import { gql, useMutation } from '@apollo/client'

const DELETE_QUEUE = gql`
  mutation DELETE_QUEUE($queueId: String!) {
    destroyQueueById(queueId: $queueId)
  }
`

export default function useFetchDestroyQueueById() {
  const [destroyQueueById] = useMutation(DELETE_QUEUE)
  return {
    destroyQueueById: ({ queueId }) => destroyQueueById({ variables: { queueId } }),
  }
}
