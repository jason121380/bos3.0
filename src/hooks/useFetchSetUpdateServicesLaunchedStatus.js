import { gql, useMutation } from '@apollo/client'

const UPDATE_SERVICES_LAUNCGED_STATUS = gql`
  mutation UPDATE_SERVICES_LAUNCGED_STATUS($input: IsLaunchedInput!) {
    updateServicesLaunchedStatus(input: $input)
  }
`

export default function useFetchSetUpdatePurchaseRecord() {
  const [updateLaunched] = useMutation(UPDATE_SERVICES_LAUNCGED_STATUS)
  return {
    updateLaunched: ({ input }) =>
      updateLaunched({
        variables: {
          input,
        },
      }),
  }
}
