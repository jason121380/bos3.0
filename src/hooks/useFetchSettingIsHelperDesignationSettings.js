import { gql, useMutation } from '@apollo/client'

const SET_HEPLER_DESIGNATION_DISPLAY = gql`
  mutation SET_HEPLER_DESIGNATION_DISPLAY($input: Boolean!) {
    setHelperDesignationDisplay(input: $input)
  }
`

export default function useFetchSettingIsHelperDesignationSettings() {
  const [setHelperDesignationDisplay] = useMutation(SET_HEPLER_DESIGNATION_DISPLAY)
  return {
    setHelperDesignationDisplay: ({ input }) =>
      setHelperDesignationDisplay({
        variables: {
          input,
        },
      }),
  }
}
