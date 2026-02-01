import { gql, useMutation } from '@apollo/client'

const RECHECKOUT_ORDER_FOM_QUEUE = gql`
  mutation RECHECKOUT_ORDER_FOM_QUEUE($queueId: String!) {
    reCheckoutOrderFromQueue(queueId: $queueId)
  }
`

export default function useFetchReCheckoutOrderFromQueue() {
  const [reCheckoutOrderFromQueue] = useMutation(RECHECKOUT_ORDER_FOM_QUEUE)
  return {
    reCheckoutOrderFromQueue: ({ queueId }) => reCheckoutOrderFromQueue({ variables: { queueId } }),
  }
}
