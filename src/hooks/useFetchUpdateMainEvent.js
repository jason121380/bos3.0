import { gql, useMutation } from '@apollo/client'

const UPDATE_MERCHANT_EVENT = gql`
  mutation UPDATE_MERCHANT_EVENT($input: UpdateMainEventInput!) {
    updateMainEvent(input: $input)
  }
`

export default function useFetchUpdateMainEvent() {
  const [updateMainEvent] = useMutation(UPDATE_MERCHANT_EVENT)
  return {
    updateMainEvent: input =>
      updateMainEvent({
        variables: {
          input,
        },
      }),
  }
}