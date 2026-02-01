import { gql, useMutation } from '@apollo/client'

const SET_UES_USEING_SETTING = gql`
  mutation SET_UES_USEING_SETTING($input: Boolean!) {
    setUESUsingSetting(input: $input)
  }
`

export default function useFetchSetUESUsingSetting() {
  const [setUESUsingSetting] = useMutation(SET_UES_USEING_SETTING)
  return {
    setUESUsingSetting: ({ input }) =>
      setUESUsingSetting({
        variables: {
          input,
        },
      }),
  }
}
