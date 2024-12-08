'use client';

export default function Developer(){
    return (
        <header className="flex h-16 w-full shrink-0 items-center px-4 py-14 md:px-12 sticky top-16 z-10 bg-white dark:bg-gray-950">
            <div className="text-primary">
        <span className="text-base"><b>Developed By: </b></span>
        <br />
        <span className="text-xs md:text-sm"> <b>Full Stack :</b>  Biswajit Rout | Ashish Kumar Singh </span>
        <br />
        <span className="text-xs md:text-sm"><b>Front-End:</b> Aditya Raj </span>
        </div>
        </header>
    )
}