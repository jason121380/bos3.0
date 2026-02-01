import { gql, useMutation } from '@apollo/client'

const END_EVENT_RULE_GROUP = gql`
  mutation END_EVENT_RULE_GROUP($groupId: ID!) {
    endEventRuleGroup(groupId: $groupId)
  }
`

export default function useFetchEndEventRuleGroup() {
  const [endEventRuleGroup] = useMutation(END_EVENT_RULE_GROUP)
  return {
    endEventRuleGroup: groupId =>
      endEventRuleGroup({
        variables: {
          groupId,
        },
      }),
  }
}