import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_SIDE_PAGE_DISPLAY = gql`
  mutation SET_CUSTOMER_SIDE_PAGE_DISPLAY($input: CustomerSidePageDisplayInput!) {
    setCustomerSidePageDisplay(input: $input)
  }
`

export default function useFetchSetCustomerSidePageDisplay() {
  const [setCustomerSidePageDisplay] = useMutation(SET_CUSTOMER_SIDE_PAGE_DISPLAY)
  return {
    setCustomerSidePageDisplay: ({ input }) =>
      setCustomerSidePageDisplay({
        variables: {
          input,
        },
      }),
  }
}