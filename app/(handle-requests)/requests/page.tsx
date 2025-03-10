"use client";

import { useState, useEffect, SVGProps } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadBookingItemsByRequestedBy, ReadCourtRequestsByRequestedBy, DeleteBookingRequest, DeleteCourtBookingRequest } from "@/lib/actions"; 
import Link from "next/link";
import Loading from "@/components/shared/Loader";
import { Models } from "node-appwrite";

// Define the Request types for items and courts
interface Request {
  $id: string;
  itemId: any;
  itemName: any;
  start: any;
  end: any;
  purpose: any;
  bookedQuantity: any;
  requestedBy: any;
  status: any;
}

interface CourtRequest {
  $id: string;
  courtId: any;
  courtName: any;
  start: any;
  end: any;
  purpose: any;
  requestedBy: any;
  status: any;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [courtRequests, setCourtRequests] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [activeTab, setActiveTab] = useState<"items" | "courts">("items");


  // Fetch requests for items and courts based on the active tab
  async function fetchRequests() {
    setLoadingPage(true);
    try {
      if (activeTab === "items") {
        const fetchedRequests = await ReadBookingItemsByRequestedBy();
        setRequests(fetchedRequests);
      } else if (activeTab === "courts") {
        const fetchedCourtRequests = await ReadCourtRequestsByRequestedBy();
        setCourtRequests(fetchedCourtRequests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoadingPage(false);
    }
  }

  // Use effect to fetch the corresponding requests on tab change
  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Handle deletion for both item and court requests
  async function handleDelete(
    requestId: string,
    itemId: string,
    bookedQuantity: number
  ) {
    setLoading(true);
    setDeleting(requestId);
    try {
      await DeleteBookingRequest(requestId, itemId, bookedQuantity);
      fetchRequests();
    } catch (error) {
      console.error("Failed to delete the request:", error);
    }
    setLoading(false);
  }

  async function handleCourtDelete(
    requestId: string
  ) {
    setLoading(true);
    setDeleting(requestId);
    try {
      await DeleteCourtBookingRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error("Failed to delete the request:", error);
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>
      
      {/* Toggle between Items and Courts */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "items" ? "default" : "outline"}
          onClick={() => setActiveTab("items")}
        >
          Item Requests
        </Button>
        <Button
          variant={activeTab === "courts" ? "default" : "outline"}
          onClick={() => setActiveTab("courts")}
        >
          Court Requests
        </Button>
      </div>
      

      {loadingPage && <Loading />}

      {/* Table for Item Requests */}
      {activeTab === "items" && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date/Time</TableHead>
                <TableHead>End Date/Time</TableHead>
                <TableHead>Requested Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...requests].reverse().map((request) => (
                <TableRow
                  key={request.$id}
                  className="border-b border-gray-200 hover:bg-muted"
                >
                  <TableCell>
                    <Link href={`/requests/${request.$id}`}>{request.itemName}</Link>
                  </TableCell>
                  <TableCell>{request.start}</TableCell>
                  <TableCell>{request.end}</TableCell>
                  <TableCell>{request.bookedQuantity}</TableCell>
                  <TableCell>
                    <Badge
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : request.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : request.status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : request.status === "issued"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    
                    {(loading && deleting==request.$id)? <Loading />:
                    request.status !== "collected" &&
                      request.status !== "returned" &&
                      request.status !== "damaged and returned" ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              request.$id,
                              request.itemId,
                              request.bookedQuantity
                            )
                          }
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      ) : null
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Table for Court Requests */}
      {activeTab === "courts" && (
  <div className="overflow-x-auto">
    <p className="text-sm font-medium text-gray-600 mb-2">
      Click on the Name of the court for QR Code. Wait till your slot starts.
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Start Date/Time</TableHead>
          <TableHead>End Date/Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...courtRequests].reverse().map((courtRequest) => {
          const currentTime = new Date();
          const startTime = new Date(courtRequest.start); // This is in UTC
          const startTimeIST = new Date(startTime.getTime() - 5.5 * 60 * 60 * 1000);
          const endTime = new Date(courtRequest.end); // This is in UTC
          const endTimeIST = new Date(endTime.getTime() - 5.5 * 60 * 60 * 1000);
          const isSlotActive = (startTimeIST <= currentTime) && (currentTime <= endTimeIST) ;          

          return (
            <TableRow
              key={courtRequest.$id}
              className="border-b border-gray-200 hover:bg-muted"
            >
              <TableCell>
                <div className="relative">
                  <Link
                    href={isSlotActive ? `/court-requests/${courtRequest.$id}` : "#"}
                    
                    className={`${
                      isSlotActive ? "text-blue-600 hover:underline" : "text-gray-500"
                    }`}
                  >
                    {courtRequest.courtName}
                  </Link>
                </div>
              </TableCell>
              <TableCell>{courtRequest.start}</TableCell>
              <TableCell>{courtRequest.end}</TableCell>
              <TableCell>
                <Badge
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    courtRequest.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : courtRequest.status === "approved"
                      ? "bg-green-200 text-green-800"
                      : courtRequest.status === "rejected"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {courtRequest.status}
                </Badge>
              </TableCell>
              <TableCell className="flex items-center gap-2">
                {(loading && deleting === courtRequest.$id) ? (
                  <Loading />
                ) : courtRequest.status !== "collected" && !loading ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleCourtDelete(courtRequest.$id)
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
)}
    </div>
  );
}

function TrashIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
