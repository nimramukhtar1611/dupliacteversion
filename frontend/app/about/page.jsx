import React from 'react'
import Navbar from '../components/Navbar'
import farmImg from '../../public/aboutimg.jpg' 
import Footer from '../components/Footer'
import Image from 'next/image';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="w-full bg-white py-20 px-4 md:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          
          {/* Left Side Image */}
          <div className="w-full md:w-1/3 flex justify-center">
           <Image
  src={farmImg}
  alt="Farm"
  width={400}      
  height={400}
  className="rounded-lg shadow-lg object-cover"
 />

          </div>

          {/* Right Side Text */}
          <div className="w-full md:w-2/3">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ fontFamily: "'Pacifico', cursive" }}>
              About Us
            </h2>

            <p className="text-gray-900 text-lg mb-4 leading-relaxed">
              Welcome to <strong><em>Noor Poultry</em></strong>, your trusted partner in high-quality poultry farming. We specialize in providing <strong><em>healthy, high-yield chickens</em></strong> for farmers and poultry enthusiasts across the region.
            </p>

            <p className="text-gray-900 text-lg mb-4 leading-relaxed">
              Our farm follows <strong><em>modern, safe, and sustainable practices</em></strong>. From breeding to feeding, we prioritize the health and well-being of our birds. Every chicken is nurtured with proper nutrition and expert care.
            </p>

            <p className="text-gray-900 text-lg mb-4 leading-relaxed">
              At <strong><em>Noor Poultry</em></strong>, we believe in <strong><em>quality, consistency, and customer satisfaction</em></strong>. We aim to provide farmers with birds that are strong, productive, and disease-free.
            </p>

            <p className="text-gray-900 text-lg leading-relaxed">
              Join us today and experience the difference that <strong><em>premium quality poultry</em></strong> can make for your farm. We are dedicated to supporting farmers and enthusiasts in every step of their poultry journey.
            </p>
          </div>

        </div>
      </div>
   <Footer/>
    </>
  )
}

export default AboutUs
