import { gql, useMutation } from '@apollo/client'

const SET_THEME = gql`
  mutation SET_THEME($input: SetThemeInput!) {
    setTheme(input: $input)
  }
`

export default function useFetchSettingTheme() {
  const [setThemeChangeData] = useMutation(SET_THEME)
  return {
    setThemeChangeData: ({ input }) =>
      setThemeChangeData({
        variables: {
          input,
        },
      }),
  }
}
