'use client'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
//   import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { PackageIcon } from "lucide-react";
import { Menu } from "lucide-react";

import { getUserId, ReadUserById } from "@/lib/actions";
import { useEffect, useState } from "react";
import AuthButton from "./auth-button";
import UserMenu from "./user-menu";
//   import { MenuIcon } from "./SocialIcons";

export default function Navbar() {
  const {data: session} = useSession();
 
  const [role, setRole] = useState<string>("");

  console.log(session)


  useEffect(()=>{
    
    async function getId(email: string){
      const userId = await getUserId(email)

      const us = await ReadUserById(userId);
      const role = us.role;
      setRole(role);
    }

    if(session){
      const user = session.user;
      const userEmail = user.email;
      if(userEmail)
        getId(userEmail);
    }

    
  }, [session])

  let link;
  if (role == "Society") {
    link = "/items-requests";
  } else if (role == "Manager") {
    link = "/manager-portal";
  }else if (role === "Admin"){
    link = "/requests-admin";
  }
   else {
    link = "/requests";
  }

  let inventory;
  if (role === "Society"){
    inventory = "/inventory-check";
  }else if (role === "Admin"){
    inventory = "/inventory-admin";
  }else{
    inventory = "/inventory";
  }
  console.log(role);

  function AddItems(): JSX.Element | null {
    if (role == "Admin") {
      return (
        <Link
          href="/add-item"
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
          prefetch={false}
        >
          Add Item
        </Link>
      );
    } else return null;
  }
  function AssignRoles(): JSX.Element | null {
    if (role == "Admin") {
      return (
        <Link
          href="/assign-role"
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
          prefetch={false}
        >
          Assign Roles
        </Link>
      );
    } else return null;
  }
  return (
    <header className="flex h-16 w-full shrink-0 items-center px-4 md:px-6 sticky top-0 z-10 bg-white dark:bg-gray-950">
      {/* Mobile Navigation Menu */}
      <div className="flex w-full lg:w-0 items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              {/* <MenuIcon className="h-6 w-6" /> */}
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Vault IIT BBS</SheetTitle>
            </SheetHeader>
            <Link href="#" className="mr-6 hidden lg:flex" prefetch={false}>
              {/* <MountainIcon className="h-6 w-6" /> */}
              {/* <div className="text-xl bg-red-300">Acme Inc</div> */}
              <span className="sr-only">Vault IIT BBS</span>
            </Link>
            <div className="grid gap-2 py-6">
              <Link
                href="/"
                className="flex w-full items-center py-2 text-base"
                prefetch={false}
              >
                Home
              </Link>
              <Link
                href="/requests"
                className="flex w-full items-center py-2 text-base"
                prefetch={false}
              >
                Profile
              </Link>
              <Link
                href={inventory}
                className="flex w-full items-center py-2 text-base"
                prefetch={false}
              >
                Inventory
              </Link>
              <Link
                href={link}
                className="flex w-full items-center py-2 text-base"
                prefetch={false}
              >
                Requests
              </Link>

              <AddItems />
              <AssignRoles/>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3 lg:hidden">
        {session ? <UserMenu /> : <AuthButton />}
          <ModeToggle />
        </div>
      </div>

      {/* Desktop Navigation Menu */}
      <Link
        href="/"
        className="mr-6 hidden lg:flex items-center justify-center"
        prefetch={false}
      >
        {/* <Image src={logoLight} alt="Vault IIT BBS" width={150}  /> */}

        <PackageIcon className="w-6 h-6" />
        <span className="text-lg font-bold">Vault IIT BBS | Developed by WebnD</span>
        {/* <Vault IIT BBSLogo /> */}
        {/* <Badge className="mx-2 h-8">BETA</Badge> */}
        <span className="sr-only">Vault IIT BBS | Developed by WebnD</span>
      </Link>
      <nav className="ml-auto hidden lg:flex gap-6 lg:items-center">
        <Link
          href="/"
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
          prefetch={false}
        >
          Home
        </Link>
        <Link
          href={inventory}
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
          prefetch={false}
        >
          Inventory
        </Link>
        <AddItems />
        <AssignRoles/>
        <Link
          href={link}
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
          prefetch={false}
        >
          Requests
        </Link>

        {session ? <UserMenu /> : <AuthButton />}
        <ModeToggle />
      </nav>
      
      
    </header>
    
  );
}
