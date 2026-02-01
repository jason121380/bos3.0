import { gql, useMutation } from '@apollo/client'

const SET_IS_NDB_NEED_VERIFY = gql`
  mutation SET_IS_NDB_NEED_VERIFY($input: Boolean!) {
    setIsNDBNeedVerify(input: $input)
  }
`
export default function useFetchSetIsNDBNeedVerify() {
  const [setIsNDBNeedVerify] = useMutation(SET_IS_NDB_NEED_VERIFY)
  return {
    setIsNDBNeedVerify: ({ input }) =>
      setIsNDBNeedVerify({
        variables: {
          input,
        },
      }),
  }
}
