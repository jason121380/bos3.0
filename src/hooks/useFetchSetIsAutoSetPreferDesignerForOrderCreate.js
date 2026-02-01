import { gql, useMutation } from '@apollo/client'

const SET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE = gql`
  mutation SET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE($input: Boolean!) {
    setIsAutoSetPreferDesignerForOrderCreate(input: $input)
  }
`

export default function useFetchSetIsAutoSetPreferDesignerForOrderCreate() {
  const [setIsAutoSetPreferDesignerForOrderCreate] = useMutation(SET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE)
  return {
    setIsAutoSetPreferDesignerForOrderCreate: ({ input }) =>
      setIsAutoSetPreferDesignerForOrderCreate({
        variables: {
          input,
        },
      }),
  }
}
