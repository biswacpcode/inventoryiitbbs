"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // To access request ID from params
import { ReadUserById, ReadCourtRequest } from "@/lib/actions"; // Replace with your actual imports
import QRCode from "react-qr-code";// QR Code library
import { Models } from "node-appwrite";
import Loading from "@/components/shared/Loader";

interface User {
  firstName: string;
  lastName: string;
}
interface CourtRequest{
    $id: string; courtName: any; start: any; end: any; companions: any; status: any; requestedUser: string;
}

export default function CourtRequestPage({ params }: { params: { id: string } }) {
  const [courtRequest, setCourtRequest] = useState<CourtRequest>();
  const [requester, setRequester] = useState<User | null>(null);
  const [companions, setCompanions] = useState<User[]>([]);

  useEffect(() => {
    async function fetchRequestDetails() {
      const requestData = await ReadCourtRequest(params.id); // Fetch court request by ID
      if (requestData) {
        setCourtRequest(requestData);

        // Fetch the requester's name
        const requesterData = await ReadUserById(requestData.requestedUser);
        setRequester(requesterData);

        // Fetch companions' names if any
        if (requestData.companions) {
          const companionIds = requestData.companions.split(",");
          const companionPromises = companionIds.map((companionId: string) =>
            ReadUserById(companionId)
          );
          const companionData = await Promise.all(companionPromises);
          setCompanions(companionData);
        }
      }
    }

    fetchRequestDetails();
  }, [params.id]);

  if (!courtRequest || !requester) {
    return <Loading/>; // Handle loading state
  }

  return (
    <div className="container mx-auto max-w-xl p-6 bg-white shadow-lg rounded-lg">
  {/* Heading */}
  <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
    Court Booking Request
  </h1>

  {/* Court Request Details */}
  <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-md">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Booking Details</h2>
    <div className="text-gray-600 space-y-2">
      <p>
        <span className="font-medium text-gray-800">Court Name:</span> {courtRequest.courtName}
      </p>
      <p>
        <span className="font-medium text-gray-800">Requested by:</span> {requester.firstName} {requester.lastName}
      </p>
      <p>
        <span className="font-medium text-gray-800">Time Slot:</span> {courtRequest.start} - {courtRequest.end}
      </p>
      <p>
        <span className="font-medium text-gray-800">Companions:</span>{" "}
        {companions.length > 0
          ? companions.map((comp) => `${comp.firstName} ${comp.lastName}`).join(", ")
          : "No companions"}
      </p>
    </div>
  </div>

  {/* QR Code Section */}
  <div className="flex flex-col items-center">
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <QRCode value={params.id} size={200} />
    </div>
    <p className="mt-4 text-sm text-gray-500 text-center">
      Scan this code for court check-in/check-out.
    </p>
  </div>
</div>

  );
}
