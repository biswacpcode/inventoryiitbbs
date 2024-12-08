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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Court Booking Request</h1>
      
      {/* Display Court Request Details */}
      <div className="mb-4">
        <p><strong>Court Name:</strong> {courtRequest.courtName}</p>
        <p><strong>Requested by:</strong> {requester.firstName} {requester.lastName}</p>
        <p><strong>Time Slot:</strong> {courtRequest.start} - {courtRequest.end}</p>
        <p><strong>Companions:</strong> {companions.length > 0 ? 
          companions.map(comp => `${comp.firstName} ${comp.lastName}`).join(", ") : 
          "No companions"}</p>
      </div>

      {/* Generate and Display QR Code */}
      <div className="mt-4">
        <QRCode value={params.id} size={200} />
        <p className="mt-2 text-sm text-gray-500">Scan this code for court check-in/check-out.</p>
      </div>
    </div>
  );
}
