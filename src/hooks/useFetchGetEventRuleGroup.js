import { gql, useQuery } from '@apollo/client'

const GET_EVENT_RULE_GROUP = gql`
  query GET_EVENT_RULE_GROUP($ruleGroupId: ID!) {
    eventRuleGroup(ruleGroupId: $ruleGroupId) {
      mainEventId
      nameForGroup
      nameDefault
      startDateDefault
      endDateDefault
      startDateForGroup
      endDateForGroup
      isSMSNotifyForGroup
      maxCountForGroup
      maxCountPerOrder
      maxCountDefault
      thresholdPrice
      endDateActual
      consumptionTypeUsing
      consumptionTypeRules {
        consumptionType
        attributionRange
        attributions
      }
      payTypeUsing
      merchants {
        id
      }
      walletDepositRules {
        payType
        depositThreshold
      }
    }
  }
`

const useFetchGetEventRuleGroup = ({ ruleGroupId }) =>
  useQuery(GET_EVENT_RULE_GROUP, {
    variables: {
      ruleGroupId,
    },
    fetchPolicy: 'cache-and-network',
  })
export default useFetchGetEventRuleGroup
