import { gql, useMutation } from '@apollo/client'

const SET_IS_REPORT_LIST_EXTENDED = gql`
  mutation SET_IS_REPORT_LIST_EXTENDED($input: Boolean!) {
    setIsReportListExtended(input: $input)
  }
`

export default function useFetchSetIsReportListExtended() {
  const [setIsReportListExtended] = useMutation(SET_IS_REPORT_LIST_EXTENDED)
  return {
    setIsReportListExtended: ({ input }) =>
      setIsReportListExtended({
        variables: {
          input,
        },
      }),
  }
}