import { gql, useMutation } from '@apollo/client'

const SET_IS_QUICK_ORDER_MODE_ON = gql`
  mutation SET_IS_QUICK_ORDER_MODE_ON($input: Boolean!) {
    setIsQuickOrderModeOn(input: $input)
  }
`

export default function useFetchSetIsQuickOrderModeOn() {
  const [setIsQuickOrderModeOnSetting] = useMutation(SET_IS_QUICK_ORDER_MODE_ON)
  return {
    setIsQuickOrderModeOnSetting: ({ input }) =>
      setIsQuickOrderModeOnSetting({
        variables: {
          input,
        },
      }),
  }
}
