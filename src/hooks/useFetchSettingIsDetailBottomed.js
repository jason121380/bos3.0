import { gql, useMutation } from '@apollo/client'

const SET_IS_DETAIL_BOTTOMED = gql`
  mutation SET_IS_DETAIL_BOTTOMED($input: Boolean!) {
    setIsDetailBottomed(input: $input)
  }
`

export default function useFetchSetIsDetailBottomed() {
  const [setIsDetailBottomed] = useMutation(SET_IS_DETAIL_BOTTOMED)
  return {
    setIsDetailBottomed: ({ input }) =>
      setIsDetailBottomed({
        variables: {
          input,
        },
      }),
  }
}
