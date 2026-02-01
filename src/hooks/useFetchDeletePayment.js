import { gql, useMutation } from '@apollo/client'

const DELETE_PAYMENT = gql`
  mutation DELETE_PAYMENT($ids: [ID!]) {
    deletePayWay(ids: $ids)
  }
`

export default function useFetchDeletePayment() {
  const [deletePayment] = useMutation(DELETE_PAYMENT)
  return {
    deletePayment: ({ ids }) => deletePayment({ variables: { ids } }),
  }
}
