import { gql, useMutation } from '@apollo/client'

const SET_EVENT_RULE_GROUP_USING= gql`
  mutation SET_EVENT_RULE_GROUP_USING($input: SetEventRuleGroupUsingInput) {
    setEventRuleGroupUsing(input: $input)
  }
`

export default function useFetchSetEventRuleGroupUsing() {
  const [setEventRuleGroupUsing] = useMutation(SET_EVENT_RULE_GROUP_USING)
  return {
    setEventRuleGroupUsing: ({ input }) =>
      setEventRuleGroupUsing({
        variables: {
          input,
        },
      }),
  }
}