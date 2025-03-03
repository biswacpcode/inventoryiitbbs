"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"; // Import router for redirection
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReadBookingItems, ReadUserById, checkRole, updateCourtRequestStatus } from "@/lib/actions"; // Import checkRole
import Link from "next/link";
import Input from "@/components/ui/input"; // Ensure this is the correct import path for your Input component
import Loading from "@/components/shared/Loader";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode"; // Import html5-qrcode
import { QrCode, X , Check} from "lucide-react";
import { Button } from "@/components/ui/button";
//import { XIcon, CheckCircleIcon } from "@heroicons/react/solid"; // Import icons (ensure you have heroicons installed)

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

interface User {
  email: string;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // New state variables for QR Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>("");

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const html5QrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check user role and decide whether to fetch data or redirect456
  async function checkAuthorization() {
    const isManager = await checkRole("Manager");
    if (!isManager) {
      alert("You are unauthorized.");
      // Redirect if unauthorized
      window.location.href = `${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL!}`;
    } else {
      fetchRequests(); // Fetch data if authorized
    }
  }

  // Fetch all booking requests and related users
  async function fetchRequests() {
    setLoading(true); // Start loading
    const fetchedRequests = await ReadBookingItems(); // Fetch booking items
    setRequests(fetchedRequests);
    await fetchUsers(fetchedRequests); // Fetch users after fetching requests
    setLoading(false); // Stop loading after fetch is complete
  }

  // Fetch users based on the booking requests in parallel
  async function fetchUsers(requests: Request[]) {
    const userIds = [
      ...new Set(requests.map((request) => request.requestedBy)),
    ]; // Get unique user IDs

    // Fetch users in parallel using Promise.all
    const userFetchPromises = userIds.map((userId) => ReadUserById(userId));
    const usersArray = await Promise.all(userFetchPromises);

    // Create a user map to store the fetched users
    const userMap: { [key: string]: User } = {};
    usersArray.forEach((user) => {
      if (user) userMap[user.$id] = user; // Use user ID as the key
    });

    setUsers(userMap); // Set the user data in the state
  }

  // Fetch requests on component mount after checking authorization
  useEffect(() => {
    checkAuthorization(); // Check authorization on component mount
  }, []);

  // Initialize the QR code scanner when the modal opens
  useEffect(() => {
    if (isModalOpen && scannerRef.current && !scanSuccess) {
      const config = { fps: 10, qrbox: 250 };
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            console.log(`Code matched = ${decodedText}`, decodedResult);
            handleScan(decodedText);
            // Removed the stop call here
          },
          (errorMessage) => {
            // parse error, ignore it.
            console.warn(`QR Code no longer in front of camera.`, errorMessage);
          }
        )
        .catch((err) => {
          // Start failed, handle it.
          console.error(`Unable to start scanning, error: ${err}`);
          alert("Unable to access camera for scanning. Please check permissions.");
        });
    }

    // Cleanup function to stop the scanner when the modal closes
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        }).catch(err => {
          console.error("Error stopping QR scanner:", err);
        });
      }
    };
  }, [isModalOpen, scanSuccess]);

  // Function to handle QR scan result
  const handleScan = (data: string) => {
    if (data) {
      console.log("Scanned QR Code:", data);
      updateStatus(data);
      setScannedData(data);
      setScanSuccess(true);
      // Optionally, close the modal after a delay
    }
  };

  // Function to handle QR scan errors
  const handleError = (err: any) => {
    console.error("QR Scan Error:", err);
    alert("Error scanning QR code. Please try again.");
  };

  // Function to update status (placeholder)
  const updateStatus = async (requestId: string) => {
    if(requestId!==""){
    await updateCourtRequestStatus(requestId);
    window.location.reload()
    }
    console.log(requestId)
    // Implement your update logic here
  };

  // Function to close the modal and reset states
  const closeModal = () => {
    setIsModalOpen(false);
    setScanSuccess(false);
    setScannedData("");
  };

  // Filter requests based on the search term (email)
  const filteredRequests = requests
    .filter((request) =>
      users[request.requestedBy]?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .reverse();

  if (loading) {
    return <Loading />; // Show loading while fetching data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>

      {/* ------------------------ SEARCH BOX AND QR BUTTON -------------------- */}
      <div className="flex items-center mb-6">
        <Input
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-background shadow-none appearance-none pl-8"
        />
        <Button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 p-2"
          variant="outline"
          aria-label="Open QR Scanner"
          title="Scan QR Code"
        >
          {/* QR Icon (You can replace this with an actual QR icon) */}
          <QrCode/>
        </Button>
      </div>

      {/* ------------------------ QR Scanner Modal -------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-11/12 max-w-md">
            {/* Close Button */}
            <Button
              onClick={closeModal}
              className="absolute top-2 right-2 ml-4 p-2"
              aria-label="Close Modal"
              variant="outline"
              title="Close"
            >
              {/* <XIcon className="h-6 w-6" /> */}
              <X/>
            </Button>

            {/* Conditional Rendering based on scanSuccess */}
            {!scanSuccess ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-black">Scan QR Code</h2>
                <div id="qr-reader" ref={scannerRef}></div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                {/* <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" /> */}
                <img src="https://cdn.dribbble.com/users/129972/screenshots/2888283/74_03_smile.gif"/>
                <h2 className="text-xl font-semibold mb-2 text-black">Scan Successful!</h2>
                <p className="text-gray-700">Data: {scannedData}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Date/Time</TableHead>
              <TableHead>End Date/Time</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow
                key={request.$id}
                className="border-b border-gray-200 hover:bg-muted"
              >
                <TableCell>
                  {users[request.requestedBy]?.email || <Loading />}
                </TableCell>
                <TableCell>
                  <Link href={`/manager-portal/${request.$id}`}>
                    {request.itemName}
                  </Link>
                </TableCell>
                <TableCell>{request.start}</TableCell>
                <TableCell>{request.end}</TableCell>
                <TableCell>{request.bookedQuantity}</TableCell>
                <TableCell>
                  <Badge
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "approved"
                        ? "bg-green-200 text-green-800"
                        : request.status === "issued"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

