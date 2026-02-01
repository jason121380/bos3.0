import { gql, useMutation } from '@apollo/client'

const VERIFY_SMS = gql`
  mutation CustomerVerifySMS($input: CustomerVerifySMSInput!) {
    customerVerifySMS(input: $input) {
      id
      userCode
    }
  }
`

export default function useFetchCustomerVerifySMS() {
  const [verifySMS] = useMutation(VERIFY_SMS)
  return {
    verifySMS: input =>
      verifySMS({
        variables: {
          input,
        },
      }),
  }
}
