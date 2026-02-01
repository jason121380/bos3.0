import { gql, useMutation } from '@apollo/client'

const SET_END_MAIN_EVENT = gql`
  mutation SET_END_MAIN_EVENT($eventId: ID!) {
    endMainEvent(eventId: $eventId)
  }
`

export default function useFetchSetEndMainEvent() {
  const [setMainEndEvent] = useMutation(SET_END_MAIN_EVENT)
  return {
    setMainEndEvent: ({ eventId }) =>
      setMainEndEvent({
        variables: {
          eventId,
        },
      }),
  }
}