import { gql, useMutation } from '@apollo/client'

const SET_TROUBLE_SHOOTING = gql`
  mutation SET_TROUBLE_SHOOTING($input: String!) {
    setTroubleShooting(input: $input)
  }
`

export default function useFetchSetTroubleShooting() {
  const [setTroubleShooting] = useMutation(SET_TROUBLE_SHOOTING)
  return {
    setTroubleShooting: ({ input }) =>
      setTroubleShooting({
        variables: {
          input,
        },
      }),
  }
}
