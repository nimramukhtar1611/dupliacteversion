import React from 'react'
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-10 px-4 md:px-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">

        {/* About / Brand */}
        <div className="md:w-1/3">
          <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Pacifico', cursive" }}>
            Noor Poultry Traders
          </h3>
          <p className="text-gray-300">
            Providing healthy, high-yield chickens with expert care and trusted service. Your partner in poultry farming.
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:w-1/3">
          <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
      <ul className="space-y-2 text-gray-300">
  <li><Link href="/" className="hover:text-white">Home</Link></li>
  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
  <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
</ul>
        </div>

        {/* Contact Info */}
        <div className="md:w-1/3">
          <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
                    <p className="text-gray-300">📧 Noortraders463@gmail.com</p>
          <p className="text-gray-300">📞 +923425188551</p>
                    <p className="text-gray-300">📞 +923125371371</p>
        </div>

      </div>

      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Noor Poultry Traders. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
