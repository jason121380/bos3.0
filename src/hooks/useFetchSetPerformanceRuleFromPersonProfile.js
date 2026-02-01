import { gql, useMutation } from '@apollo/client'

const SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE = gql`
  mutation SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE($input: PerformanceRuleInput!) {
    setPerformanceRuleFromPersonProfile(input: $input) 
  }
`

export default function useFetchSetPerformanceRuleFromPersonProfile() {
  const [setPersonProfile] = useMutation(SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE)
  return {
    setPersonProfile: ({ input }) =>
      setPersonProfile({
        variables: {
          input,
        },
      }),
  }
}