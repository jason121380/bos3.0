import { gql, useMutation } from '@apollo/client'

const CREATE_SERVICE = gql`
  mutation CREATE_SERVICE($input: CreateServiceInput!) {
    createService(input: $input)
  }
`
export default function useFetchCreateService() {
  const [createService] = useMutation(CREATE_SERVICE)
  return {
    createService: ({ input }) =>
      createService({
        variables: {
          input,
        },
      }),
  }
}
