import { gql, useQuery } from '@apollo/client'

const GET_BONUS_REWARD_RULE = gql`
  query GET_BONUS_REWARD_RULE {
    getParameterAboutSettingFunction {
      bonusRewardRule {
        isUsing
        rule {
          price
          bonus
          mode
        }
      }
    }
  }
`

export default function useFetchGetBonusRewardRule() {
  return useQuery(GET_BONUS_REWARD_RULE, {
    fetchPolicy: 'cache-and-network',
  })
}
