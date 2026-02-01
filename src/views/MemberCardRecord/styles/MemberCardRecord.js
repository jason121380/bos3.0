import { css } from '@emotion/react'
import { theme } from '../../../theme'
import { red } from '@mui/material/colors'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  categorieDiv: css({
    margin: '10px 0px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500] + '!important',
    color: 'white',
    '&:hover': {
      backgroundColor: red[700] + '!important',
    },
  }),
}
