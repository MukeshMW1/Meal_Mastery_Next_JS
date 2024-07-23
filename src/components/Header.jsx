import {React} from 'react'

export const Header=()=>{
    return(
        <div className="mt-[40px] flex items-center justify-center mb-4 gap-4  text-secondary-light">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTObbxnTRARq3vIAr_z3Iks4bqVkMsuck7eRw&s" alt="Chef Icon" className="mr-2 rounded-[50%] cursor-pointer lg:h-[50px] lg:w-[50px] h-[20px] w-[20px]" />



        <h1 className="lg:text-[18px] sm:text-[12px] font-bold">Generate Food Recipe with AI</h1>



      </div>
    )
}
