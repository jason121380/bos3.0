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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '4px',
              height: '18px',
              backgroundColor: '#1A73E8',
              marginRight: '8px',
              borderRadius: '2px',
            }}
          />
          <Typography component="h3" variant="h3" style={{ color: style && style.color }}>
            {title}
          </Typography>
        </div>
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