import { gql, useMutation } from '@apollo/client'

export const CREATE_MAIN_EVENT = gql`
  mutation CREATE_MAIN_EVENT($input: CreateMainEventInput!) {
    createMainEvent(input: $input)
  }
`

export default function useFetchCreateMainEvent() {
  const [createMainEvent] = useMutation(CREATE_MAIN_EVENT)
  return {
    createMainEvent: input =>
      createMainEvent({
        variables: {
          input,
        },
      }),
  }
}
