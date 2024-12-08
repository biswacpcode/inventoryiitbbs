"use client";
import { useState, useEffect } from "react";
import { JSX, SVGProps } from "react";
import { ApproveBookingRequest, DamagedQuantityUpdate, DeleteBookingRequest, ReadBookedItembyId, ReadInventoryItemById, ReadUserById } from "@/lib/actions";
import Loading from "@/components/shared/Loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define the type for the item
interface InventoryItem {
  $id: string;
  itemImage: string;
  itemName: string;
  availableQuantity: number;
  totalQuantity: number;
  society: string;
  council: string;
}

interface Requested {
  bookedQuantity: number;
  status: string;
}

interface User {
  firstName: string;
  lastName: string;
}

export default function Component({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [request, setRequest] = useState<Requested | null>(null);
  const [societyName, setSocietyName] = useState<string>("");
  const [councilName, setCouncilName] = useState<string>("");
  const [isDamaged, setIsDamaged] = useState(false); // New state for checkbox

  // Fetch the inventory item details
  useEffect(() => {
    async function fetchItem() {
      try {
        const fetchedItem: InventoryItem = await ReadBookedItembyId(params.id);
        setItem(fetchedItem);
        const fetchRequst: Requested = await ReadBookedItembyId(params.id);
        setRequest(fetchRequst);

        // Fetch society and council details after fetching the item
        if (fetchedItem) {
          const society = await ReadUserById(fetchedItem.society);
          const council = await ReadUserById(fetchedItem.council);
          setSocietyName(society.lastName);
          setCouncilName(council.lastName);
        }
      } catch (error) {
        console.error("Error fetching item or user data", error);
      }
    }
    fetchItem();
  }, [params.id]);

  async function handleDelete(
    requestId: string,
    itemId: string,
    bookedQuantity: number
  ) {
    try {
      // Send 0 if the item is marked as damaged, otherwise send the booked quantity
      await DeleteBookingRequest(requestId, itemId, isDamaged ? 0 : bookedQuantity);
      if (isDamaged){
        await DamagedQuantityUpdate(itemId, bookedQuantity);
      }
    } catch (error) {
      console.error("Failed to delete the request:", error);
    }
  }

  async function approveItem(requestId: string, statusTo: string) {
    try {
      await ApproveBookingRequest(requestId, statusTo);
    } catch (error) {
      console.error("Failed to change status:", error);
    }
  }

  const Buttons = () => {
    if (!request || !item) return null; // Handle null or undefined request and item safely

    if (request.status === "approved") {
      return (
        <>
          <Link href={`/requests`}>
            <Button
              size="sm"
              className="mt-4 w-full"
              onClick={() => approveItem(params.id, "issued")}
              title="Issue"
            >
              Received
            </Button>
          </Link>
          <div className="mt-4 flex items-center">
          <input
                type="checkbox"
                id="damaged-checkbox"
                className="mr-2"
                checked={isDamaged}
                onChange={() => setIsDamaged(!isDamaged)}
              />
              <label htmlFor="damaged-checkbox" className="mr-4">
                Damaged
              </label>
          
          <Link href={`/requests`}>
            
              {/* Checkbox for damaged item */}
              
              <Button
                size="sm"
                onClick={() =>
                  handleDelete(params.id, item.$id, request.bookedQuantity)
                }
              >
                Refused
              </Button>
           
          </Link>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  // Display a loading state if the item is not yet fetched
  if (!item) {
    return <Loading />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 p-4 md:p-8 lg:p-12">
      {/* ---------------------- ITEM DETAILS ---------------------- */}
      <div className="grid gap-4">
        <img
          src={item.itemImage}
          alt={item.itemName}
          width={600}
          height={400}
          className="rounded-lg object-cover w-full aspect-[3/2]"
        />
        <div className="grid gap-2">
          <h2 className="text-2xl font-bold">{item.itemName}</h2>

          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="w-5 h-5" />
            <span>Society: {societyName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BuildingIcon className="w-5 h-5" />
            <span>Council: {councilName}</span>
          </div>
          <Buttons />
        </div>
      </div>
    </div>
  );
}

// SVG Icon Components
function BuildingIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
