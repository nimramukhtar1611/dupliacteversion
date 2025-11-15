"use client"
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import emailjs from "@emailjs/browser";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        "service_mneithg",
        "template_6zruvgt",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        "G2Y15w5IrFuJLLCiu"
      )
      .then(() => {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alert("Something went wrong. Please try again!");
        setLoading(false);
      });
  }

  return (
    <>
      <Navbar/>
      <div className="w-full min-h-screen flex justify-center items-start py-16">
        <div className="p-8 w-full max-w-lg">
          <div className="mb-6 text-center">
            <h2 className="text-5xl font-bold mb-10" style={{ fontFamily: "'Pacifico', cursive" }}>
              GET IN TOUCH
            </h2>
            <p className="text-gray-700 mb-1">We provide the <strong>best quality chickens</strong>.</p>
            <p className="text-gray-700 mb-1">Our birds are healthy and high-yield.</p>
            <p className="text-gray-700">Fill out the form below to get in touch with us today!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Your Name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Your Email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
            <textarea 
              name="message" 
              placeholder="Your Message / Order Details" 
              value={formData.message} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              rows="4"
              required
            ></textarea>
            <button 
              type="submit" 
              className={`w-full bg-black text-white font-semibold p-3 rounded hover:bg-gray-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default ContactForm
