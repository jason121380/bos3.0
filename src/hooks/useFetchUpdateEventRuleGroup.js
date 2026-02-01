import { gql, useMutation } from '@apollo/client'

const UPDATE_EVENT_RULE_GROUP = gql`
  mutation UPDATE_EVENT_RULE_GROUP($input: UpdateEventRuleGroupInput!) {
    updateEventRuleGroup(input: $input)
  }
`

export default function useFetchUpdateEventRuleGroup() {
  const [updateRule] = useMutation(UPDATE_EVENT_RULE_GROUP)
  return {
    updateRule: input =>
      updateRule({
        variables: {
          input,
        },
      }),
  }
}
