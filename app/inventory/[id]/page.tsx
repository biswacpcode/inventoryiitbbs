"use client";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import  Input  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useState, useEffect, FormEvent } from "react";
import { ReadInventoryItemById, CreateBookingRequest, ReadUserById, DeleteBookingRequest } from "@/lib/actions";
import Loading from "@/components/shared/Loader";
import { useRouter } from "next/navigation";

export default function Component({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null);
  const [zyada, setZyada] = useState(true);
  const [purpose, setPurpose] = useState("");
  const [purLength, setPurLength] = useState(0); // To track start time // To track end time
  const [societyName, setSocietyName] = useState<string>("");
  const [societyEmail, setSocietyEmail] = useState<string>("");
    const [councilName, setCouncilName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();


  useEffect(() => {
    async function fetchItem() {
      const fetchedItem = await ReadInventoryItemById(params.id);
      setItem(fetchedItem);

      if (fetchedItem) {
        const society = await ReadUserById(fetchedItem.society);
        const council = await ReadUserById(fetchedItem.council);
        setSocietyName(society.lastName);
        setSocietyEmail(society.email);
        setCouncilName(council.lastName);

    }
    const response = await fetch('/api/user-info',{
      method:'POST'
    });
    const data = await response.json();
    const user = data.user;
    setUser(user);
    }

    fetchItem();
  }, [params.id]);

  const handleQuantityChange = (e: any) => {
    const value = parseInt(e.target.value, 10);
    setZyada(isNaN(value) || (value > item.availableQuantity && value > 0) || value > item.maxQuantity);
  };

 

  

  
  
  const handlePurposeChange = (e: any) => {
    const purposeValue = e.target.value;
    setPurpose(purposeValue);
    setPurLength(purposeValue.length);
    checkEmptyFields(purposeValue);
  };
  

  const checkEmptyFields = (
    purpose: string
  ) => {
    const isAnyFieldEmpty =!purpose.trim();
    setZyada(isAnyFieldEmpty);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form fields if necessary
    if (zyada || purLength === 0) {
      return;
    }

    setIsLoading(true);



    try {
      const bookedQuantity = parseInt(
        (e.currentTarget.elements.namedItem("bookedQuantity") as HTMLInputElement).value,
        10
      );
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      
      // Get the current date and time
      const currentDate = new Date();
      const startDate = formatDate(currentDate);
      const startTime = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS format
      
      // Calculate endDate by adding maxTime (in days) to the current date
      const maxTime = item.maxTime; // Replace this with your actual maxTime value
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + maxTime);
      const formattedEndDate = formatDate(endDate);
      
      // Set end time to 23:59:59
      const endTime = "23:59:59";
      // Prepare form data
      const formData = new FormData();
      formData.append("itemId", item.$id);
      formData.append("requestedTo", item.society);
      formData.append("startDate", startDate);
      formData.append("startTime", startTime);
      formData.append("endDate", formattedEndDate);
      formData.append("endTime", endTime);
      formData.append("bookedQuantity", bookedQuantity.toString());
      formData.append("purpose", purpose);
      formData.append("status", item.defaultStatus);

      // Call the CreateBookingRequest function
      const requestId = await CreateBookingRequest(formData);
      if (user && item.defaultStatus==="pending"){
        const bookingDetails = {
          requesterName: `${user.given_name} ${user.family_name}`,
          itemName: item.itemName,
          bookedQuantity: bookedQuantity.toString(),
          purpose: purpose,
          approveLink: `https://inventory-iitbbs.vercel.app/items-requests?approveId=${requestId}`,
          rejectLink: `https://inventory-iitbbs.vercel.app/items-requests?rejectId=${requestId}`
        };
 // Call the API route to send the email
        await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: `${societyEmail}`,
            bookingDetails,
          }),
        });
      }else{
        await DeleteBookingRequest(requestId, item.$id, bookedQuantity);
        alert("You may have been logged out. \nPlease try again");
        router.push('/');
      }
      

      
  
     
      
    
    }
  

      // Optionally, you can navigate the user or show a success message here
      // For example:
      // router.push("/success");
     catch (error) {
      console.error("Error creating booking request:", error);
      // Handle error appropriately (e.g., show a notification)
    } finally {
      setIsLoading(false);
    }
    router.push('/requests');
  };

  if (!item) return <Loading/>;

  return (
    <div className="grid md:grid-cols-2 gap-8 p-4 md:p-8 lg:p-12">
      {/* ---------------------- ITEM DETAILS ---------------------- */}
      <div className="grid gap-4">
        <img
          src={item.itemImage}
          alt="Issue Item"
          width={600}
          height={400}
          className="rounded-lg object-cover w-full aspect-[3/2]"
        />
        <div className="grid gap-2">
          <h2 className="text-2xl font-bold">{item.itemName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PackageIcon className="w-5 h-5" />
            <span>Available: {item.availableQuantity}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>Damaged: {(item.damagedQuantity) ? item.damagedQuantity : 0}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>Total: {item.totalQuantity}</span>
            
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PackageIcon className="w-5 h-5" />
            <span>Maximum Amount: {item.maxQuantity}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>Allowed Time to Keep: {item.maxTime}</span>
            
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="w-5 h-5" />
            <span>Society: {societyName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BuildingIcon className="w-5 h-5" />
            <span>Council: {councilName}</span>
          </div>
        </div>
      </div>

      {/* ---------------------- BOOKING DETAILS ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Reserve Item</CardTitle>
          <CardDescription>
            Select the dates and quantity you need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <input type="hidden" name="itemId" value={item.$id} />
                <input type="hidden" name="requestedTo" value={item.society} />
                
              </div>
              
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                id="quantity"
                min="1"
                name="bookedQuantity"
                onChange={handleQuantityChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose (Required)</Label>
              <Textarea
                id="purpose"
                rows={3}
                name="purpose"
                value={purpose}
                onChange={handlePurposeChange}
              />
            </div>
            {isLoading ?
            <Loading/> :
            <Button
              size="lg"
              className="w-full"
              style={{
                cursor: zyada ? "not-allowed" : "pointer",
                pointerEvents: zyada ? "none" : "auto",
              }}
              disabled={zyada || purLength===0}
            >
              Reserve Item
            </Button>
            }
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function BuildingIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
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
      <path d="M21 8a2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
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
  );
}
