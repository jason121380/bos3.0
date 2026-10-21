import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'
// 讀取全部會員卡類別
const FETCH_MEMBERSHIPS_CATEGORY = settingsQuery(gql`
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
`)
export function useFetchGetMembershipCategories(input) {
  return useQuery(FETCH_MEMBERSHIPS_CATEGORY, {
    variables: {
      input,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

// 篩選會員卡類別
const FETCH_MEMBERSHIP_CATEGORY = settingsQuery(gql`
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
`)
export function useFetchGetMembershipCategory(categoryUUID) {
  return useQuery(FETCH_MEMBERSHIP_CATEGORY, {
    variables: {
      categoryUUID,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
