"use client";
import { useState, useEffect } from "react";
import { ApproveBookingRequest, checkRole, DamagedQuantityUpdate, ReadBookedItembyId, ReadUserById, receivetimeUpdate, returntimeUpdate } from "@/lib/actions";
import Loading from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
    const [loading, setLoading] = useState<boolean>(false);
    const [isDamaged, setIsDamaged] = useState(false);
    const router = useRouter();

    // Move the function fetchItem outside of useEffect
    async function fetchItem() {
        try {
            const response = await ReadBookedItembyId(params.id);

            // Cast the response to the correct types
            const fetchedItem: InventoryItem = response;
            const fetchRequest: Requested = response;

            setItem(fetchedItem);
            setRequest(fetchRequest);

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

    async function checkAuthorization() {
        const isManager = await checkRole("Manager");
        if (!isManager) {
            alert("You are unauthorized.");
            // Redirect if unauthorized
            window.location.href = "https://inventory-iitbbs.vercel.app/";
        } else {
            fetchItem(); // Fetch data if authorized
        }
    }

    useEffect(() => {
        checkAuthorization();
    }, [params.id]);

    async function approveItem(requestId: string, statusTo: string, itemId: string, bookedQuantity: number) {
        setLoading(true);
        if (isDamaged) statusTo = "damaged&returned";
        try {
            const currentTime = new Date().toISOString();

            // If the status is to "collected", record receive time
            if (statusTo === "collected") {
                await receivetimeUpdate(requestId, currentTime);
            }

            // If the status is to "returned", record return time
            if (statusTo === "returned" || statusTo === "damaged&returned") {
                await returntimeUpdate(requestId, itemId, currentTime, isDamaged ? 0 : bookedQuantity);
            }

            // Update the booking request status
            await ApproveBookingRequest(requestId, statusTo);

            await DamagedQuantityUpdate(itemId, bookedQuantity);

            // Redirect after success
            router.push("/manager-portal");
        } catch (error) {
            console.error("Failed to change status:", error);
        } finally {
            setLoading(false);
        }
    }

    const Buttons = () => {
        if (!request || !item) return null;

        if (request.status === "issued") {
            return (
                <>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Button
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => approveItem(params.id, "collected", item.$id, request.bookedQuantity)}
                            title="Issue"
                        >
                            Issued
                        </Button>
                    )}
                </>
            );
        } else if (request.status === "collected") {
            return (
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
                    {loading ? (
                        <Loading />
                    ) : (
                        <Button
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => approveItem(params.id, "returned", item.$id, request.bookedQuantity)}
                            title="Return"
                        >
                            Returned
                        </Button>
                    )}
                </div>
            );
        } else {
            return (
                <>
                    <Button size="sm" className="mt-4 w-full" onClick={() => window.location.reload()} title="Wait">
                        Wait till I turn to Issued
                    </Button>
                </>
            );
        }
    };

    if (!item) {
        return <Loading />;
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 p-4 md:p-8 lg:p-12">
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
                        <span>Society: {societyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Council: {councilName}</span>
                    </div>
                    <Buttons />
                </div>
            </div>
        </div>
    );
}
