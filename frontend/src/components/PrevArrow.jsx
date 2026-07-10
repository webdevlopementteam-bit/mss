

const PrevArrow = ({onClick}) => {
  return (
    <>
    <div
      onClick={onClick}
      className="absolute -left-1 top-1/2 -translate-y-1/2
                 z-10 w-8 h-8 flex items-center justify-center
                 rounded-full shadow cursor-pointer
                 bg-primaryColor transition"
    >
     <i class="fa-solid fa-angle-left text-white"></i>
    </div>
    </>
  )
}

export default PrevArrow
