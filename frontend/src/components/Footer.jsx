import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
       <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
          {/*---------Left Section----------*/}
          <div>
            <img className='mb-5 w-40' src={assets.logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. At error numquam ea nulla eligendi iusto quidem laudantium quasi repellendus mollitia fuga laboriosam quam quas soluta ipsa, aperiam sunt, architecto quisquam.</p>
          </div>

          {/*---------Center Section--------*/}
          <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Contact us</li>
                <li>Privacy policy</li>
            </ul>
          </div>
          {/*---------Right Section--------*/}
          <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+8801-234-5678</li>
                <li>prescripto@gmail.com</li>
            </ul>
          </div>
       </div>

       {/*-----------@copyright--------------*/}
       <div>
          <hr />
          <p className='py-5 text-sm text-center'>Copyright © 2024 - All Right Reserved</p>
       </div>
    </div>
  )
}

export default Footer
