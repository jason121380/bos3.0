import { gql, useMutation } from '@apollo/client'

const SET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER = gql`
  mutation SET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER($input: [RequiredColumn]!) {
    setRequiredColumnForNewCustomer(input: $input)
  }
`

export default function useFetchSetRequiredColumnForNewCustomer() {
  const [setRequiredColum] = useMutation(SET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER)
  return {
    setRequiredColum: ({ input }) =>
      setRequiredColum({
        variables: {
          input,
        },
      }),
  }
}