import { gql, useMutation } from '@apollo/client'

export const CREATE_EVENT_RULE_GROUP = gql`
  mutation CREATE_EVENT_RULE_GROUP($input: CreateEventRuleGroupInput!) {
    createEventRuleGroup(input: $input)
  }
`

export default function useFetchCreateEventRuleGroup() {
  const [createRule] = useMutation(CREATE_EVENT_RULE_GROUP)
  return {
    createRule: input =>
      createRule({
        variables: {
          input,
        },
      }),
  }
}
