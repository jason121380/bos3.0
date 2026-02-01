import { gql, useMutation } from '@apollo/client'

const SET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER = gql`
  mutation SET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER($input: Boolean!) {
    setIsAbleToChangeDateTimeInOrderCreate(input: $input)
  }
`
export default function useFetchSetIsAbleToChangeDateTimeInOrderCreate() {
  const [setIsAbleToChangeDateTimeInOrderCreateSetting] = useMutation(
    SET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER
  )
  return {
    setIsAbleToChangeDateTimeInOrderCreateSetting: ({ input }) =>
      setIsAbleToChangeDateTimeInOrderCreateSetting({
        variables: {
          input,
        },
      }),
  }
}
