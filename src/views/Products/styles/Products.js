import { css } from '@emotion/react'
import { red } from '@mui/material/colors'
import { theme } from '../../../theme'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
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
    color: 'white !important',
  }),
}