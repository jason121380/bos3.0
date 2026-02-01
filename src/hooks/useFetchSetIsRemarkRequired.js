import { gql, useMutation } from '@apollo/client'

const SET_IS_REMARK_REQUIRED = gql`
  mutation SET_IS_REMARK_REQUIRED($input: Boolean!) {
    setIsRemarkRequired(input: $input)
  }
`

export default function useFetchSetIsRemarkRequired() {
  const [setRemarkRequired] = useMutation(SET_IS_REMARK_REQUIRED)
  return {
    setRemarkRequired: ({ input }) =>
      setRemarkRequired({
        variables: {
          input,
        },
      }),
  }
}