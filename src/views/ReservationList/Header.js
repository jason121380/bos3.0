function Header({ ...rest }) {
  return (
    <div {...rest}>
      <h1
        className="text-title !font-bold text-text"
        onClick={() => {
          localStorage.clear()
        }}
      >
        預約記錄
      </h1>
    </div>
  )
}

export default Header
