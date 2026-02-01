import { gql, useMutation } from '@apollo/client'

const SET_IS_MEMBERSHIP_CARD_ACTIVE = gql`
  mutation SET_IS_MEMBERSHIP_CARD_ACTIVE($input: Boolean!) {
    setIsMemberShipCardActive(input: $input)
  }
`
export default function useFetchSetIsMemberShipCardActive() {
  const [setIsMemberShipCardActiveSetting] = useMutation(SET_IS_MEMBERSHIP_CARD_ACTIVE)
  return {
    setIsMemberShipCardActiveSetting: ({ input }) =>
      setIsMemberShipCardActiveSetting({
        variables: {
          input,
        },
      }),
  }
}
