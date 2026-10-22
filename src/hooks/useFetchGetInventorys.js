import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_INVENTORYS = gql`
  query GET_INVENTORYS($input: GetInventoryInput!) {
    getInventorys(input: $input) {
      draft {
        id
        date
        isDraft
        creatorName
      }
      checked {
        id
        date
        isDraft
        creatorName
      }
    }
  }
`

export function useFetchGetInventorysLazy({ input }) {
  const [getInventorysLazy, inventorysData] = useLazyQuery(GET_INVENTORYS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return [getInventorysLazy, inventorysData]
}

const GET_INVENTORY = gql`
  query GET_INVENTORY($inventoryId: ID!) {
    getInventory(inventoryId: $inventoryId) {
      id
      date
      isDraft
      creatorName
      details {
        productId
        productName
        productNo
        productCategoryId
        currentCount
        inventoryCount
      }
    }
  }
`

export function useFetchGetInventory({ inventoryId }) {
  return useQuery(GET_INVENTORY, {
    variables: {
      inventoryId,
    },
    fetchPolicy: 'cache-and-network',
  })
}