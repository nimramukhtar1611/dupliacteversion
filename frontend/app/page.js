import React from 'react'
import Navbar from './components/Navbar'
import img from '../public/farm.jpg'
import Footer from './components/Footer'
const Page = () => {
  return (
    <div>
      <Navbar />
  <div className="w-full h-[400px] md:h-[600px] relative">
  <img
    src={img.src}
    alt="Farm"
    className="w-full h-full object-cover"
  />
  
  <div className="absolute inset-0 bg-black/30"></div> 

  {/* Text */}
  <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center">
    <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Pacifico', cursive" }}>
At Noor Poultry Traders </h1>
<div className="text-xl md:text-2xl mt-4" > we are committed to providing healthy, high-yield breeds to poultry farmers and enthusiasts alike. Our focus is on proper nutrition, safe practices, and expert care, ensuring that every bird grows strong and productive. </div>
  </div>
</div>

<Footer/>
    </div>

  )
}

export default Page