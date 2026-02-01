import { gql, useMutation } from '@apollo/client'

const SET_IS_RTC_USING = gql`
  mutation SET_IS_RTC_USING($input: Boolean!) {
    setIsRTCUsing(input: $input)
  }
`

export default function useFetchSetIsRTCUsing() {
  const [setIsRTCUsinSetting] = useMutation(SET_IS_RTC_USING)
  return {
    setIsRTCUsinSetting: ({ input }) =>
      setIsRTCUsinSetting({
        variables: {
          input,
        },
      }),
  }
}