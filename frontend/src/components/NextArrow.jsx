
const NextArrow = ({onClick}) => {
  return (
    <>
      <div
      onClick={onClick}
      className="absolute -right-1 top-1/2 -translate-y-1/2
                 z-10 w-8 h-8 flex items-center justify-center
                 rounded-full shadow cursor-pointer
                 bg-primaryColor transition"
    >
      <i className="fa-solid fa-angle-right text-white"></i>
    </div>
    </>
  )
}

export default NextArrow
