import { gql, useMutation } from '@apollo/client'

const SET_IS_NRC_DISPLAY_FOR_NEW_CUS = gql`
  mutation SET_IS_NRC_DISPLAY_FOR_NEW_CUS($input: Boolean!) {
    setIsNRCDisplayForNewCus(input: $input)
  }
`

export default function useFetchSetIsNRCDisplayForNewCus() {
  const [setNRCDisplayForNewCus] = useMutation(SET_IS_NRC_DISPLAY_FOR_NEW_CUS)
  return {
    setNRCDisplayForNewCus: ({ input }) =>
      setNRCDisplayForNewCus({
        variables: {
          input,
        },
      }),
  }
}