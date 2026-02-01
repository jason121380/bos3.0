import { gql, useMutation } from '@apollo/client'

const UPDATE_SERVICE = gql`
  mutation UPDATE_SERVICE($input: UpdateServiceInput!) {
    updateService(input: $input)
  }
`

export default function useFetchUpdateService() {
  const [updateService] = useMutation(UPDATE_SERVICE)
  return {
    updateService: ({ input }) =>
      updateService({
        variables: {
          input,
        },
      }),
  }
}
