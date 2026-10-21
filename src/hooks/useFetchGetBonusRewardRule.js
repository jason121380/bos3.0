import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_BONUS_REWARD_RULE = settingsQuery(gql`
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
`)

export default function useFetchGetBonusRewardRule() {
  return useQuery(GET_BONUS_REWARD_RULE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
