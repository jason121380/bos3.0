import { gql, useQuery } from '@apollo/client'

const GET_ACCOUNTING_TYPE = gql`
  query GET_ACCOUNTING_TYPE($input: AccountingTypeEnum) {
    getAccountingType(input: $input)
  }
`

export default function useFetchAccountingType({ input }) {
  return useQuery(GET_ACCOUNTING_TYPE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
