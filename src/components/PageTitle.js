/** @jsxImportSource @emotion/react */
import { Grid, Typography } from '@mui/material'
import PropTypes from 'prop-types'

const PageTitle = ({ title, subTitle, className, style }) => {
  return (
    <Grid css={className} className='noprint' style={style}>
      <Grid item>
        {subTitle && (
          <Typography component="h2" gutterBottom variant="overline">
            {subTitle}
          </Typography>
        )}
        <Typography component="h3" variant="h3">
          {title}
        </Typography>
      </Grid>
    </Grid>
  )
}
PageTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  className: PropTypes.object,
  style: PropTypes.object
}

export default PageTitle