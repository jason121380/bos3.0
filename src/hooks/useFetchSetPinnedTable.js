import { gql, useMutation } from '@apollo/client'

const SET_PINNED_TABLE = gql`
  mutation SET_PINNED_TABLE($input: SetPinnedTableInput!) {
    setPinnedTable(input: $input)
  }
`

export default function useFetchSetPinnedTable() {
  const [setPinnedTable] = useMutation(SET_PINNED_TABLE)
  return {
    setPinnedTable: ( input ) =>
      setPinnedTable({
        variables: {
          input,
        },
      }),
  }
}