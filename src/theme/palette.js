import { colors } from 'ui/colors'

const white = 'rgb(255, 255, 255)'

export default {
  primary: {
    contrastText: white,
    dark: '#174EA6',
    main: '#1A73E8 !important', // Google Blue
    light: '#D2E3FC',
  },
  secondary: {
    contrastText: white,
    dark: '#3A3A3C',
    main: '#8E8E93 !important', // iOS Grey
    light: '#C7C7CC',
  },
  error: {
    contrastText: white,
    dark: '#8E0000',
    main: '#FF3B30 !important', // iOS Red
    light: '#FF6961',
  },
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    link: '#007AFF',
  },
  link: '#007AFF',
  icon: '#007AFF',
  background: {
    default: '#F2F2F7', // iPadOS background
    paper: white,
  },
  divider: '#C6C6C8',
}
