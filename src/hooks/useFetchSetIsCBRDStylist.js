import { gql, useMutation } from '@apollo/client'

const SET_IS_CBRD_STYLIST = gql`
  mutation SET_IS_CBRD_STYLIST($input: Boolean!) {
    setIsCBRDStylist(input: $input)
  }
`

export default function useFetchSetIsCBRDStylist() {
  const [setCBRDStylistData] = useMutation(SET_IS_CBRD_STYLIST)
  return {
    setCBRDStylistData: ({ input }) =>
      setCBRDStylistData({
        variables: {
          input,
        },
      }),
  }
}
