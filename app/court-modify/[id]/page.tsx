"use client";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectGroup,
  } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import  Input  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useState, useEffect, FormEvent } from "react";
import { ReadInventoryItemById, CreateBookingRequest, ReadUserById, CreateInventoryItem, fetchUsersByRole, UpdateImage, ModifyInventoryItem, checkRole, ReadCourtById } from "@/lib/actions";
import Loading from "@/components/shared/Loader";
import { Models } from "node-appwrite";
import Modal from "@/components/shared/Modal";

export default function Component({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null);
  const [purpose, setPurpose] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);



  useEffect(() => {
    async function checkAuthorization() {
        const isAdmin = true //await checkRole("Admin");
        if (!isAdmin) {
          alert("You are unauthorized.");
           // Redirect if unauthorized
           window.location.href = "https://inventory-iitbbs.webnd-iitbbs.org/";
        } else {
          fetchItem(); // Fetch data if authorized
        }
      }
    async function fetchItem() {
      const fetchedItem = await ReadCourtById(params.id);
      setItem(fetchedItem);
      console.log(fetchItem)

     
    }

    checkAuthorization();
  }, [params.id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit clicked");

    // Validate form fields if necessary

    setIsLoading(true);
    const formdata = new FormData(e.currentTarget);
      const changedSociety = formdata.get("society");
      const changedCouncil = formdata.get("council");
      const changedStatus = formdata.get("defaultStatus");
      const parts = (item.itemImage).split('/');
        const fileId = parts[parts.indexOf("files") + 1];
      const imageFile = formdata.get("itemImage") as File;
      const society = (changedSociety)? changedSociety : item.society;
      
      const council = (changedCouncil)?changedCouncil: item.council;
      
      const status = (changedStatus)?changedStatus : item.defaultStatus;
      const itemName = formdata.get("court-name") !== '' ? formdata.get("court-name") : item.courtName;
      const description = formdata.get("description") !== '' ? formdata.get("description") : item.description;
      const totalQuantity = formdata.get("total-quantity") !== '' ? parseInt(formdata.get("total-quantity") as string, 10) : item.totalQuantity;
      const availableQuantity = formdata.get("available-quantity") !== '' ? parseInt(formdata.get("available-quantity") as string, 10) : item.availableQuantity;
      const maxQuantity = formdata.get("allowed-quantity") !== '' ? parseInt(formdata.get("allowed-quantity") as string, 10) : item.maxQuantity;
      const maxTime = formdata.get("allowed-time") !== '' ? parseInt(formdata.get("allowed-time") as string, 10) : item.maxTime;
    let itemImage;

    try {
        itemImage = imageFile && imageFile.size > 0 ? await UpdateImage(fileId, formdata) : item.itemImage;
    }catch(error){
        console.error("Error in uploading new image", error);
        throw new Error("Error in uploading new image");
    }
      
        
try{
const isEqualToItemValues = 
    itemName === item.itemName &&
    itemImage === item.itemImage &&
    description === item.description &&
    totalQuantity === item.totalQuantity &&
    availableQuantity === item.availableQuantity &&
    maxQuantity === item.maxQuantity &&
    maxTime === item.maxTime &&
    society === item.society &&
    council === item.council &&
    status === item.defaultStatus;
    if(isEqualToItemValues)
    {
        setModalOpen(true);
    } else{
        const uploadformdata = new FormData();
uploadformdata.append("itemName", itemName);
uploadformdata.append("itemImage", itemImage);
uploadformdata.append("description", description);
uploadformdata.append("total-quantity", totalQuantity);
uploadformdata.append("available-quantity", availableQuantity);
uploadformdata.append("allowed-quantity", maxQuantity);
uploadformdata.append("allowed-time", maxTime);
uploadformdata.append("society", society);
uploadformdata.append("council", council);
uploadformdata.append("defaultStatus", status);


await ModifyInventoryItem(item.$id, uploadformdata);
    }



    
    } catch (error) {
      console.error("Error modifing item:", error);
      // Handle error appropriately (e.g., show a notification)
    } finally {
      setIsLoading(false);
      window.location.href = `https://inventory-iitbbs.webnd-iitbbs.org/inventory-admin/${params.id}`;
    }
  };

  if (!item) return <Loading/>;
  const goToInventory = () => {
    window.location.href = "https://inventory-iitbbs.webnd-iitbbs.org/inventory-admin"; // Redirect to inventory
};
const modalClose= () => {
    setModalOpen(false)
    window.location.href = `https://inventory-iitbbs.webnd-iitbbs.org/inventory-admin/${params.id}`; // Reload
};
  

  return (
    
    <Card className="max-w-2xl mx-auto p-6 sm:p-8 md:p-10">
        <Modal
                isOpen={isModalOpen}
                onClose={modalClose}
                onGoBack={goToInventory}
            />
        
    <CardHeader>
      <CardTitle className="text-3xl font-bold">
        Modify {item.courtName}
        <img
          src={item.courtImage}
          alt="Court Image"
          width={300}
          height={200}
          className="rounded-lg object-cover w-60 aspect-[3/2]"
        />
      </CardTitle>
      <CardDescription>
        Change the details that are needed to update your inventory.
      </CardDescription>
    </CardHeader>
    <CardContent>
    <form onSubmit={handleSubmit} className="grid gap-6" encType="multipart/form-data">
          {/* Name and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="court-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="court-name"
                name="court-name"
                placeholder={item.courtName}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="court-image" className="text-sm font-medium">
                Image
              </Label>
              <Input
                id="court-image"
                type="file"
                name="courtImage"
                accept="image/*"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="court-location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="court-location"
              name="court-location"
              placeholder={item.location}
              required
            />
          </div>

          {/* Total Courts and Max Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="total-courts" className="text-sm font-medium">
                Total Number of Courts
              </Label>
              <Input
                id="total-courts"
                name="total-courts"
                type="number"
                placeholder={item.totalCourts}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-time" className="text-sm font-medium">
                Maximum Time for User (in hours)
              </Label>
              <Input
                id="max-time"
                name="max-time"
                type="number"
                placeholder={item.maxTime}
                required
              />
            </div>
          </div>

          {/* Minimum Users */}
          <div className="grid gap-2">
            <Label htmlFor="min-users" className="text-sm font-medium">
              Minimum Number of Users to Get Access
            </Label>
            <Input
              id="min-users"
              name="min-users"
              type="number"
              placeholder={item.minUsers}
              required
            />
          </div>

          {/* Time Slots */}
          <div className="grid gap-2">
            <Label htmlFor="time-slots" className="text-sm font-medium">
              Time Slots for Every Day
            </Label>
            <Textarea
              id="time-slots"
              name="time-slots"
              placeholder={item.timeSlots}
              required
            />
            <small className="text-muted-foreground">
              Example: Monday:- 05:00-10:00, 17:00-21:00; Tuesday:- 05:00-10:00, 17:00-21:00
            </small>
          </div>

          {/* Submit Button */}
          {
            isLoading ? (
                <Loading/>
            ):(
                <Button>Save Court</Button>
            )
        }
        </form>
        

    </CardContent>
    {/* <CardFooter className="flex justify-end">
      
    </CardFooter> */}
  </Card>
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
