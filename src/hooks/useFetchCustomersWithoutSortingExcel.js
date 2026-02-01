import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL = gql`
  query FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL($input: CustomersWithoutSortingInput!) {
    customersWithoutSortingExcel(input: $input)
  }
`
export default function useFetchCustomersWithoutSortingExcel(input) {
  return useQuery(FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchCustomersWithoutSortingExcelLazy() {
  const [getCustomersWithoutSortingExcelLazy, getCustomersWithoutSortingExcelLazyData] = useLazyQuery(FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomersWithoutSortingExcelLazy, getCustomersWithoutSortingExcelLazyData]
}
