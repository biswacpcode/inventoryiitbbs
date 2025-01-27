    // app/courts/[id]/page.tsx

    "use client";

    import { useState, useEffect, FormEvent } from "react";
    import { useRouter } from "next/navigation";
    import {
    Card,
    CardHeader,
    CardTitle,
  CardDescription,
    CardContent,
    } from "@/components/ui/card";
    import { Label } from "@/components/ui/label";
    import Input from "@/components/ui/input";
    import { Textarea } from "@/components/ui/textarea";
    import { Button } from "@/components/ui/button";
    import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectGroup } from "@/components/ui/select";
    import Loading from "@/components/shared/Loader";
    import { format, addDays } from "date-fns";
    import { JSX, SVGProps } from "react";

    // Import server-side functions
    import { ReadCourtBookingsByCourtIdAndDate, ReadCourtById as ServerReadCourtById } from "@/lib/actions";
    import { GenerateAvailableTimeSlots as ServerGenerateAvailableTimeSlots } from "@/lib/actions";
    import { ReadUserByEmail as ServerReadUserByEmail } from "@/lib/actions";
    import { CreateCourtRequest as ServerCreateCourtRequest } from "@/lib/actions";
    import { Models } from "node-appwrite";
import { signIn } from "next-auth/react";

    // Update the User interface if needed
interface User {
    id: string; // Assuming Appwrite uses $id
    email: string;
  }
  
  
  export default function CourtBookingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [court, setCourt] = useState<Models.Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate]  =useState<string>( format(new Date(), 'yyyy-MM-dd')); // Initialize with current date
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
    const [currentEntry, setcurrentEntry] = useState<string>("");
    const [companionEmails, setCompanionEmails] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addButton, setAddButton] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
     // Initialize as null
     const [permission, setPermission] = useState<boolean>(true);
     const [maxComp, setMaxComp] = useState<number>(0);
     const [isUpdating, setIsUpdating] = useState(false);
     
  
    useEffect(() => {
      async function fetchCourt() {
        try {
          const fetchedCourt = await ServerReadCourtById(params.id);
          if (fetchedCourt) {
            setCourt(fetchedCourt);
            const maxCom = fetchedCourt.minUsers;
            setMaxComp(maxCom);
      
          } else {
            alert("Court not found.");
            router.push("/courts");
          }
        } catch (error) {
          console.error("Failed to fetch court details:", error);
          alert("Failed to fetch court details.");
        } finally {
          setLoading(false);
        }
      }
  
      async function fetchUser() {
        try {
          const response = await fetch('/api/user-info', {
            method: 'POST',
          });
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            setUserId(data.userId);
          } else {
            // router.push("/");
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          // router.push("/"); // Redirect on error as well
        }
      }
  
      fetchCourt();
      fetchUser();

      

    }, [params.id, router]);

    
    

  
    useEffect(() => {
      async function fetchAvailableSlots() {
        if (selectedDate && court) {
          try {
            const slots = await ServerGenerateAvailableTimeSlots(court.$id, selectedDate);

            const now = new Date();
            const currentISTTime = new Date(
              now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            ).toTimeString().slice(0, 8);

            const filteredSlots = slots.filter(slot => {
              const [, endTime] = slot.split(" - "); // Extract end time
              return endTime > currentISTTime; // Compare end time with current time
            });
            
            if (format(now, 'yyyy-MM-dd')===selectedDate)
            setAvailableTimeSlots(filteredSlots);
            else
            setAvailableTimeSlots(slots);
          } catch (error) {
            console.error("Failed to fetch available time slots:", error);
            setAvailableTimeSlots([]);
          }
        } else {
          setAvailableTimeSlots([]);
        }
      }
  
      fetchAvailableSlots();

    }, [selectedDate, court]);
  
    const handleCompanionEmailChange = (index: number, value: string) => {
            const updatedEmails = [...companionEmails];
            updatedEmails[index] = value;
            setCompanionEmails(updatedEmails);
    };
  

  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      if (!selectedTimeSlot || companionEmails.length < (court?.minUsers || 0)) {
        alert("Please fill in all required fields.");
        return;
      }
  
      if (!user) {
        alert("User not logged in.");
        signIn("google");
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        // Check if user and companions have ongoing reservations
        const canReserve = await checkReservations(userId!, companionEmails, selectedDate);
        if (!canReserve.canReserve) {
          alert(canReserve.message);
          return;
        }
  
        // Fetch companion user IDs based on emails
        const companionUserIds: string[] = [];
        for (const email of companionEmails) {
          const companionUser = await ServerReadUserByEmail(email);
          if (companionUser) {
            companionUserIds.push(companionUser.$id);
          } else {
            alert(`User with email ${email} not found.`);
            return;
          }
        }
  
        // Create court booking request
        const bookingId = await ServerCreateCourtRequest({
          courtId: court!.$id,
          courtName: court!.courtName,
          requestedUser: userId!,
          companions: companionUserIds,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
        });
        router.push('/requests'); // Redirect to your reservations page
      } catch (error: any) {
        console.error("Error reserving court:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };
     const checkPermission = async (userId: string, date: string) => {
        const existingBookings = await ReadCourtBookingsByCourtIdAndDate(params.id, date);
        console.log(userId)
        for (const booking of existingBookings) {
            if (
              booking.status === "reserved" ||
              booking.status === "punched-in"
            ) {
              if (
                userId ===(booking.requestedUser) ||
                booking.companions.split(",").includes(userId)
              ) {
                setPermission(false);
              }
            }
          }
          console.log(permission)
     }
    if(user){
        if(permission)
            checkPermission(userId!, selectedDate);
        else{
            alert("You have one reservation already");
            router.push('/inventory')}
    }
  
    const checkReservations = async (userId: string, companionEmails: string[], date: string) => {
      // Check if user and companions have ongoing reservations
      
      const companionUserIds: string[] = [];
      for (const email of companionEmails) {
        if (email!==user?.email) {
          const companionUser = await ServerReadUserByEmail(email!);
          if (companionUser) {
            if (companionUserIds.includes(companionUser.$id)){
              return { canReserve: false, message: `You are trying to sneek in multiple same email ids` };
            }
            else
            companionUserIds.push(companionUser.$id);
          } else {
            return { canReserve: false, message: `User with email ${email} not found.` };
          }
        } else {
          return { canReserve: false, message: `You are trying to sneek in your own email id` };
        }
        
        
      }
  
      // Combine user ID and companion IDs
      const allUserIds = [userId, ...companionUserIds];
  
      // Fetch existing bookings
      const existingBookings = await ReadCourtBookingsByCourtIdAndDate(court!.$id, date);
  
      // Check if any booking overlaps
      for (const booking of existingBookings) {
        if (
          booking.status === "reserved" ||
          booking.status === "punched-in"
        ) {
          if (
            allUserIds.includes(booking.requestedUser) ||
            booking.companions.split(",").some((comp: string) => allUserIds.includes(comp))
          ) {
            return { canReserve: false, message: "You or your companions have an ongoing reservation. Please wait until it is completed." };
          }
        }
      }
  
      return { canReserve: true, message: "No ongoing reservations." };
    };
  
    if (loading || !court) return <Loading />;

    console.log(permission);

    const handleCompanionEmailsSubmit = () => {
      if (isUpdating) {
        // Clear and update array with new emails
        setCompanionEmails([...companionEmails]);
      } else {
        // First submission: Push all emails
        setCompanionEmails([...companionEmails]);
      }
      setIsUpdating(true); // Change button state to "Update Changes"
    };
  
    return (
      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 lg:p-12">
        {/* ---------------------- COURT DETAILS ---------------------- */}
        <div className="flex-1 grid gap-4">
          <img
            src={court.courtImage}
            alt={court.courtName}
            className="rounded-lg object-cover w-full aspect-[3/2]"
          />
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold">{court.courtName}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Location: {court.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Minimum Users: {court.minUsers}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Maximum Time per Reserve: {court.maxTime} hour(s)</span>
            </div>
          </div>
        </div>
  
        {/* ---------------------- BOOKING FORM ---------------------- */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Reserve Court</CardTitle>
            <CardDescription>Select your preferred time slot and companions to reserve the court for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="dateSelection">Select Date</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedDate === format(new Date(), "yyyy-MM-dd") ? "default" : "outline"}
                    onClick={async () => {
                      const today = format(new Date(), "yyyy-MM-dd");
                      setSelectedDate(today);
                      const slots = await ServerGenerateAvailableTimeSlots(court.$id, today);
                      setAvailableTimeSlots(slots);
                    }}
                    type="button"
                  >
                    Today
                  </Button>
                  <Button
                    variant={selectedDate === format(addDays(new Date(), 1), "yyyy-MM-dd") ? "default" : "outline"}
                    onClick={async () => {
                      const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
                      setSelectedDate(tomorrow);
                      const slots = await ServerGenerateAvailableTimeSlots(court.$id, tomorrow);
                      setAvailableTimeSlots(slots);
                    }}
                    type="button"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant={selectedDate === format(addDays(new Date(), 2), "yyyy-MM-dd") ? "default" : "outline"}
                    onClick={async () => {
                      const tomorrow = format(addDays(new Date(), 2), "yyyy-MM-dd");
                      setSelectedDate(tomorrow);
                      const slots = await ServerGenerateAvailableTimeSlots(court.$id, tomorrow);
                      setAvailableTimeSlots(slots);
                    }}
                    type="button"
                  >
                    Day After Tomorrow
                  </Button>
                </div>
              </div>
              {/* Time Slot Selection */}
              <div className="grid gap-2">
                <Label htmlFor="timeSlot">Available Time Slots</Label>
                <Select
                  name="timeSlot"
                  value={selectedTimeSlot}
                  onValueChange={(value) => setSelectedTimeSlot(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Slots</SelectLabel>
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot, index) => (
                          <SelectItem key={index} value={slot}>
                            {slot}
                          </SelectItem>
                        ))
                      ) : (
                        // Provide a non-empty value for the "No available slots" item
                        <SelectItem value="no-slots" disabled>
                          No available slots
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
  
              {/* Companion Emails */}
                <div className="grid gap-2">
                  <Label>Companion Emails</Label>
                  {maxComp === 0 ? (
                    <p>No companions needed.</p>
                  ) : (
                    <div>
                      {Array.from({ length: maxComp }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="email"
                            placeholder={`Companion ${index + 1} Email`}
                            value={companionEmails[index] || ""}
                            onChange={(e) =>
                              handleCompanionEmailChange(index, e.target.value)
                            }
                            required
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={handleCompanionEmailsSubmit}
                        disabled={companionEmails.length < maxComp || companionEmails.some((email) => email.trim() === "")}
                      >
                        {isUpdating ? "Update Changes" : "Add Companions"}
                      </Button>
                    </div>
                  )}
                  <small className="text-muted-foreground">
                    Enter the email addresses of your {maxComp} companions.
                  </small>
                </div>

  
              {/* Submit Button */}
              {isSubmitting ? (
                <Loading />
              ) : (
                <Button type="submit" className="w-full" disabled= {!permission} title={permission?"Reserve":"You have already one reserved quantity"}>
                  Reserve Court
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  
