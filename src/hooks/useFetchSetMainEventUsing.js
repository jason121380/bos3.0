import { gql, useMutation } from '@apollo/client'

const SET_MAIN_EVENT_USING = gql`
  mutation SET_MAIN_EVENT_USING($input: SetMainEventUsingInput!) {
    setMainEventUsing(input: $input)
  }
`

export default function useFetchSetMainEventUsing() {
  const [setMainEventUsing] = useMutation(SET_MAIN_EVENT_USING)
  return {
    setMainEventUsing: ({ input }) =>
      setMainEventUsing({
        variables: {
          input,
        },
      }),
  }
}
