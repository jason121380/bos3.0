import { gql, useQuery } from '@apollo/client'
// 讀取全部會員卡類別
const FETCH_MEMBERSHIPS_CATEGORY = gql`
  query FETCH_MEMBERSHIPS_CATEGORY($input: MembershipCategoriesInput!) {
    membershipCategories(input: $input) {
      uuid
      no
      name
      isUsing
      updatedAt
      creator {
        name
      }
    }
  }
`
export function useFetchGetMembershipCategories(input) {
  return useQuery(FETCH_MEMBERSHIPS_CATEGORY, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

// 篩選會員卡類別
const FETCH_MEMBERSHIP_CATEGORY = gql`
  query FETCH_MEMBERSHIP_CATEGORY($categoryUUID: ID!) {
    membershipCategory(categoryUUID: $categoryUUID) {
      id
      uuid
      no
      name
      isUsing
      updatedAt
      creator {
        name
      }
    }
  }
`
export function useFetchGetMembershipCategory(categoryUUID) {
  return useQuery(FETCH_MEMBERSHIP_CATEGORY, {
    variables: {
      categoryUUID,
    },
    fetchPolicy: 'cache-and-network',
  })
}
