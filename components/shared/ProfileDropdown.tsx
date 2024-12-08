
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface DropdownProps {
  picture: string | undefined;
}

export function ProfileDropdown({ picture }: DropdownProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <img src={picture} alt="Profile Image" className="rounded-full h-8 w-8 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Link href={`/requests`}>Profile</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><LogoutLink>Sign out</LogoutLink></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
