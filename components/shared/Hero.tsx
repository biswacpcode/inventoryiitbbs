'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { JSX, SVGProps, useEffect } from "react"
import { useRouter } from "next/navigation";



export default function Component() {
  return (
      

    <div className="flex flex-col min-h-screen">
      
      <main className="flex-1">
        <section
          id="hero"
          className="bg-primary py-20 px-6 md:px-12 lg:px-20 flex flex-col items-center justify-center text-center"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4 max-w-3xl">
            Streamline Your Inventory Management with Vault IIT BBS
          </h1>
          <p className="text-sm md:text-lg text-primary-foreground mb-8 max-w-2xl">
            Vault IIT BBS is a powerful inventory management system designed to help the Students&apos; Gymkhana at IIT
            Bhubaneswar keep track of their assets and resources.
          </p>
          <div className="flex gap-4">
            <a href="#about">
            <Button variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
            </a>
            <Button className="w-full sm:w-auto">Get Started</Button>
          </div>
        </section>
        <section id="about" className="py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">About Vault IIT BBS</h2>
              <p className="text-muted-foreground mb-4">
                Vault IIT BBS is a comprehensive inventory management system developed by the Students&apos; Gymkhana at IIT
                Bhubaneswar. It helps the Gymkhana keep track of all their assets, from sports equipment to event
                supplies, ensuring efficient resource utilization and better decision-making.
              </p>
              <p className="text-muted-foreground">
                With Vault IIT BBS, the Gymkhana can easily manage item details, track usage, and generate reports, all
                in one centralized platform. This system helps the Gymkhana optimize their inventory, reduce waste, and
                focus on delivering the best experience for the students.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg"
                width={400}
                height={400}
                alt="About Vault IIT BBS"
                className="rounded-lg"
                style={{ aspectRatio: "400/400", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
        <section id="features" className="bg-muted py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground mb-8">
              Vault IIT BBS offers a range of features to streamline your inventory management.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-6 text-left">
                <PackageIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Inventory Tracking</h3>
                <p className="text-muted-foreground">
                  Keep track of all your assets, from sports equipment to event supplies, in one centralized system.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <UsersIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  Manage user access and permissions, ensuring secure and controlled access to your inventory data.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <FileTextIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Reporting</h3>
                <p className="text-muted-foreground">
                  Generate detailed reports on inventory usage, trends, and more to make informed decisions.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <CalendarIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Booking and Reservations</h3>
                <p className="text-muted-foreground">
                  Allow users to book and reserve items, ensuring efficient resource utilization and availability.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <TruckIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Item Checkout</h3>
                <p className="text-muted-foreground">
                  Streamline the checkout process, track item usage, and ensure timely returns.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <SettingsIcon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Customizable Settings</h3>
                <p className="text-muted-foreground">
                  Tailor the system to your specific needs with customizable settings and preferences.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <img
                src="https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg"
                width={400}
                height={400}
                alt="How Vault IIT BBS Works"
                className="rounded-lg"
                style={{ aspectRatio: "400/400", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">How Vault IIT BBS Works</h2>
              <p className="text-muted-foreground mb-4">
                Vault IIT BBS is designed to be intuitive and easy to use, making inventory management a breeze for the
                Students&apos; Gymkhana.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <PackageIcon className="w-6 h-6 mb-2 text-primary" />
                  <h3 className="text-lg font-bold mb-1">Add Items</h3>
                  <p className="text-muted-foreground">
                    Easily add new items to your inventory, including details like name, description, and quantity.
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <UsersIcon className="w-6 h-6 mb-2 text-primary" />
                  <h3 className="text-lg font-bold mb-1">Manage Users</h3>
                  <p className="text-muted-foreground">
                    Assign user roles and permissions to control access to your inventory data.
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <FileTextIcon className="w-6 h-6 mb-2 text-primary" />
                  <h3 className="text-lg font-bold mb-1">Generate Reports</h3>
                  <p className="text-muted-foreground">
                    Gain valuable insights by generating detailed reports on inventory usage and trends.
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <TruckIcon className="w-6 h-6 mb-2 text-primary" />
                  <h3 className="text-lg font-bold mb-1">Track Checkouts</h3>
                  <p className="text-muted-foreground">
                    Monitor item checkouts and returns, ensuring efficient resource utilization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <section id="contact" className="bg-muted py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">Have questions or need more information? Contact us today.</p>
            <form className="bg-background rounded-lg p-6 text-left max-w-md mx-auto">
              <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Enter your name" />
              </div>
              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="mb-4">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </div>
        </section> */}
      </main>
      <footer className="bg-primary text-primary-foreground py-6 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <PackageIcon className="w-6 h-6" />
            <span className="text-lg font-bold">Vault IIT BBS</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#" className="hover:underline" prefetch={false}>
              About
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Features
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              How It Works
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function CalendarIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}


function FileTextIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}


function MenuIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function PackageIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}


function SettingsIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function TruckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}


function UsersIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}