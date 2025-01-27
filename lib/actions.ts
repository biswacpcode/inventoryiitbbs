"use server";

import { database, users , storage} from "@/lib/appwrite.config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Models, Query } from "node-appwrite";
import { Socket } from "dgram";

export async function getUserId(email:string) {
  const response = await database.listDocuments(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!, 
    [Query.equal("email", email)]
  );

  return response.documents[0].$id;
}

export async function getUser(){
    const session = await getServerSession(authOptions);
    console.log('User Details:', {
      name: session?.user?.name,
      email: session?.user?.email,
      image: session?.user?.image,
      id: session?.user.id
    });
    return session?.user;
  
};


export async function checkExistence(email: string){
  const response = await database.listDocuments(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!, 
    [Query.equal("email", email)]
  );

  if (response.documents.length>0)
    return true;
  else
  return false;
}


export async function CreateNewUser(name:string, email: string, image: string, role: string) {
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.splice(1).join(" ");
  const id = ID.unique();
  try{
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      id,
      {
        id:id,
        firstName,
        lastName,
        email,
        role,
        imageUrl: image,
      }
    )
  }catch(error){
    console.error("Error create new user :", error);
    throw new Error ("Error create new user : ");
  }
}

// ADDING NEW INVENTORY ITEM
export async function CreateInventoryItem(formdata: FormData) {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    redirect("/");
    return;
  }

  // EXTRACTING FORM DATA
  const itemName = formdata.get("name") as string;
  const itemImage = formdata.get("itemImage") as File; // Corrected key
  const totalQuantity = parseInt(formdata.get("total-quantity") as string, 10);
  const availableQuantity = parseInt(formdata.get("available-quantity") as string, 10);
  const description = formdata.get("description") as string;
  const society = formdata.get("society") as string;
  const council = formdata.get("council") as string;
  const defaultStatus = formdata.get("defaultStatus") as string;
  const maxQuantity = parseInt(formdata.get("allowed-quantity") as string, 10);
  const maxTime = parseInt(formdata.get("allowed-time") as string, 10);

  let imageUrl = '';

  // Handle file upload to Appwrite Storage
  if (itemImage && itemImage.size > 0) {
    try {
      const response = await storage.createFile(
        process.env.BUCKET_ID!,    // Your Appwrite bucket ID
        'unique()',                // Unique file ID
        itemImage                  // The file to be uploaded
      );

      // After uploading, construct the URL to access the file
      imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${response.$id}/view?project=${process.env.PROJECT_ID}`;
      
      console.log("Image uploaded successfully:", imageUrl);
      
    } catch (error) {
      console.error("Error uploading file to Appwrite storage:", error);
      throw new Error("Failed to upload image to Appwrite storage");
    }
  } else {
    imageUrl = 'https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg';
    console.warn("No image file provided or file is empty.");
  }
  

  // Create a new document in Appwrite database
  try {
    await database.createDocument(
      process.env.DATABASE_ID!,              // Your Appwrite database ID
      process.env.ITEMS_COLLECTION_ID!,      // Your collection ID
      'unique()',                            // Unique document ID
      {
        itemName,
        description,
        totalQuantity,
        availableQuantity,
        society,
        council,
        defaultStatus,
        itemImage: imageUrl,// Store the image URL in the database
        maxQuantity,
        maxTime,                  
        addedBy: user.email                 // Use the correct user ID property
      }
    );

    console.log("Inventory item created successfully.");
    revalidatePath('/add-item');
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    throw new Error("Failed to create inventory item");
  }

  redirect("/inventory");
}


// Create Courts
export async function CreateInventoryCourt(formdata: FormData) {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    redirect("/");
    return;
  }

  // EXTRACTING FORM DATA
  const courtName = formdata.get("court-name") as string;
  const courtImage = formdata.get("courtImage") as File;
  const location = formdata.get("court-location") as string;
  const totalCourts = parseInt(formdata.get("total-courts") as string, 10);
  const maxTime = parseInt(formdata.get("max-time") as string, 10);
  const minUsers = parseInt(formdata.get("min-users") as string, 10);
  const timeSlotsRaw = formdata.get("time-slots") as string;

  let courtImageUrl = "";

  // HANDLE IMAGE UPLOAD TO APPWRITE STORAGE
  if (courtImage && courtImage.size > 0) {
    try {
      const response = await storage.createFile(
        process.env.BUCKET_ID!, // Your Appwrite bucket ID
        "unique()",             // Unique file ID
        courtImage              // The file to be uploaded
      );

      // Construct the URL to access the file
      courtImageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${response.$id}/view?project=${process.env.PROJECT_ID}`;

      console.log("Court image uploaded successfully:", courtImageUrl);
    } catch (error) {
      console.error("Error uploading court image to Appwrite storage:", error);
      throw new Error("Failed to upload court image");
    }
  } else {
    courtImageUrl = "https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg";
    console.warn("No court image provided or file is empty.");
  }

  // PARSE TIME SLOTS
  // Expected format: "Monday: 05:00-10:00, 17:00-21:00; Tuesday: 05:00-10:00, 17:00-21:00"
  const timeSlots: Record<string, string[]> = {};

  if (timeSlotsRaw) {
    console.log("raw entry passed");
    const days = timeSlotsRaw.split(";");
    console.log(days);
    days.forEach((day) => {
      const [dayName, slots] = day.split(":-");
      console.log([dayName,slots]);
      if (dayName && slots) {
        const trimmedDay = dayName.trim();
        const slotArray = slots
          .split(",")
          .map((slot) => slot.trim())
          .filter((slot) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(slot)); // Basic validation
        if (slotArray.length > 0) {
          timeSlots[trimmedDay] = slotArray;
        }
      }
    });
  }

  // VALIDATE TIME SLOTS
  if (Object.keys(timeSlots).length === 0) {
    throw new Error("Invalid or missing time slots format.");
  }

  // CREATE COURT DOCUMENT IN APPWRITE DATABASE
  try {
    await database.createDocument(
      process.env.DATABASE_ID!,            // Your Appwrite database ID
      process.env.COURTS_COLLECTION_ID!,   // Your courts collection ID
      "unique()",                          // Unique document ID
      {
        courtName,
        courtImage: courtImageUrl,
        location,
        totalCourts,
        maxTime,
        minUsers,
        timeSlots: JSON.stringify(timeSlots), // Store as JSON string
        addedBy: user.email,                    // Use the correct user ID property
      }
    );

    console.log("Court created successfully.");
    // Optionally, revalidate paths or perform other actions
  } catch (error) {
    console.error("Failed to create court:", error);
    throw new Error("Failed to create court");
  }
// console.log(
//   {
//           courtName,
//           courtImage: courtImageUrl,
//          location,
//           totalCourts,
//           maxTime,
//           minUsers,
//           timeSlots: JSON.stringify(timeSlots), // Store as JSON string
//          addedBy: user.id,                    // Use the correct user ID property
//        }


  redirect("/inventory");
}


// update image bucket
export async function UpdateImage(fileId: string, formdata: FormData){
  const imageFile = formdata.get("itemImage") as File;
  if (imageFile && imageFile.size > 0) {
    if (fileId!=="https:")
  try {
    await storage.deleteFile(
      process.env.BUCKET_ID!,    // Your Appwrite bucket ID
      fileId
    );
  } catch (error) {
    console.error("Error deleting old file to Appwrite storage:", error);
    throw new Error("Failed to deleting old image to Appwrite storage");
  }

  try {
    const response = await storage.createFile(
      process.env.BUCKET_ID!,    // Your Appwrite bucket ID
      'unique()',                // Unique file ID
      imageFile                  // The file to be uploaded
    );

    // After uploading, construct the URL to access the file
    const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${response.$id}/view?project=${process.env.PROJECT_ID}`;
    
    return imageUrl;


    
  } catch (error) {
    console.error("Error updating file to Appwrite storage:", error);
    throw new Error("Failed to updating image to Appwrite storage");
  }
}


}

//Modify Inventory Item
export async function ModifyInventoryItem(itemId: string, formdata: FormData) {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    redirect("/");
    return;
  }

  // EXTRACTING FORM DATA
  const itemName = formdata.get("itemName") as string;
  const itemImage = formdata.get("itemImage") as string; // Corrected key
  const totalQuantity = parseInt(formdata.get("total-quantity") as string, 10);
  const availableQuantity = parseInt(formdata.get("available-quantity") as string, 10);
  const description = formdata.get("description") as string;
  const society = formdata.get("society") as string;
  const council = formdata.get("council") as string;
  const defaultStatus = formdata.get("defaultStatus") as string;
  const maxQuantity = parseInt(formdata.get("allowed-quantity") as string,10);
  const maxTime = parseInt(formdata.get("allowed-time") as string, 10);
  console.log(itemName);

  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,              // Your Appwrite database ID
      process.env.ITEMS_COLLECTION_ID!,
      itemId,
      {
        itemName: itemName,
        itemImage: itemImage,
        description: description,
        totalQuantity: totalQuantity,
        availableQuantity: availableQuantity,
        maxQuantity: maxQuantity,
        maxTime: maxTime,
        society: society,
        council: council,
        defaultStatus: defaultStatus
      }
    )
  }catch(error){
    console.error("Failed to modify inventory", error);
    throw new Error("Failed to modify inventory");
  }
}

//Modify Inventory Item
export async function ModifyCourtItem(itemId: string, formdata: FormData) {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    redirect("/");
    return;
  }

  // EXTRACTING FORM DATA
  const courtName = formdata.get("courtName") as string;
  const courtImage = formdata.get("courtImage") as string; // Corrected key
  const totalCourts = parseInt(formdata.get("total-courts") as string, 10);
  const minUsers = parseInt(formdata.get("min-users") as string, 10);
  const location = formdata.get("location") as string;
  const timeSlots = formdata.get("timeSlots") as string;
  const maxTime = parseInt(formdata.get("allowed-time") as string, 10);


  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,              // Your Appwrite database ID
      process.env.COURTS_COLLECTION_ID!,
      itemId,
      {
        courtName:courtName,
        courtImage:courtImage,
        location: location,
        totalCourts: totalCourts,
        maxTime: maxTime,
        minUsers:minUsers,
        timeSlots:timeSlots
      }
    )
  }catch(error){
    console.error("Failed to modify court", error);
    throw new Error("Failed to modify court");
  }
}




//check coorect Society

export async function checkSocietyCorrect(requestId: string){
  const user = await getUser();

  if (!user) {
    return false; // Or handle the unauthorized case as needed
  }

  try{
    const userId = await getUserId(user.email!);
    const us = await ReadUserById(userId);
    const society_extracted = us.$id;
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, 
      [Query.equal("$id", [requestId])]
    );
    if (society_extracted === response.documents[0].requestedTo)
      return true;
    else
    return false;
  }catch (error) {
    console.error("Failed to check role:", error);
    throw new Error("Failed to check role");
  }

}

//Check if authorized role or not
export async function checkRole(role: string){
  const user = await getUser();

  if (!user) {
    return false; // Or handle the unauthorized case as needed
  }

  try{
    if(user.email){
      const userId = await getUserId(user.email);
    const us = await ReadUserById(userId);
    const role_assigned = us.role;
    if (role_assigned === role)
      return true;
    else
    return false;
    }
    
  }catch (error) {
    console.error("Failed to check role:", error);
    throw new Error("Failed to check role");
  }

}

// READING INVENTORY ITEMS
export async function ReadInventoryItems() {
  // VERIFYING USER
  const user = await getUser();

  // if (!user) {
  //   return null; // Or handle the unauthorized case as needed
  // }

  try {
    // Fetch inventory items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      [Query.limit(400)]
    );

    // Map the documents to the InventoryItem type
    const items = response.documents.map((doc) => ({
      $id: doc.$id,
      itemName: doc.itemName,
      itemImage: doc.itemImage,
      totalQuantity: doc.totalQuantity,
      availableQuantity: doc.availableQuantity,
      description: doc.description,
      society: doc.society,
      council: doc.council,
      addedBy: doc.addedBy,
      issuedQuantity: doc.totalQuantity-doc.availableQuantity-doc.damagedQuantity,
      damagedQuantity: doc.damagedQuantity
    }));
    console.log(items.length);

    return items;
  } catch (error) {
    console.error("Failed to read inventory items:", error);
    throw new Error("Failed to read inventory items");
  }
}

//READ ALL COURTS IN INVENTORY
export async function ReadInventoryCourts() {
  // VERIFYING USER
  const user = await getUser();

  // if (!user) {
  //   return null; // Or handle the unauthorized case as needed
  // }

  try {
    // Fetch inventory items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.COURTS_COLLECTION_ID!
    );

    // Map the documents to the InventoryItem type
    const items = response.documents.map((doc) => ({
      $id: doc.$id,
      courtName: doc.courtName,
      courtImage: doc.courtImage,
      location: doc.location
    }));

    return items;
  } catch (error) {
    console.error("Failed to read inventory items:", error);
    throw new Error("Failed to read inventory items");
  }
}


// GET INVENTORY ITEM BY ID
export async function ReadInventoryItemById(itemId: string) {
  try {
    // Fetch a single inventory item by ID
    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );

    // Map the document to the InventoryItem type
    const item = {
      $id: response.$id,
      itemName: response.itemName,
      itemImage: response.itemImage,
      totalQuantity: response.totalQuantity,
      availableQuantity: response.availableQuantity,
      description: response.description,
      society: response.society,
      council: response.council,
      addedBy: response.addedBy,
      damagedQuantity: response.damagedQuantity,
      defaultStatus: response.defaultStatus,
      maxQuantity: response.maxQuantity,
      maxTime: response.maxTime
    };

    return item;
  } catch (error) {
    console.error("Failed to read inventory item:", error);
    throw new Error("Failed to read inventory item");
  }
}
// Read Booking request per ID

export async function ReadBookedItembyId(requestId: string) {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, 
      [Query.equal("$id", [requestId])]
    );

    if (response.documents.length === 0) {
      throw new Error("No items found");
    }

    const doc = response.documents[0];
    const inventoryItem = await ReadInventoryItemById(doc.itemId);
    const bookedQuanitity: number = doc.bookedQuantity;
    const status: string = doc.status;

    return {
      $id: inventoryItem.$id,
      itemName: inventoryItem.itemName,
      itemImage: inventoryItem.itemImage,
      totalQuantity: inventoryItem.totalQuantity,
      availableQuantity: inventoryItem.availableQuantity,
      description: inventoryItem.description,
      society: inventoryItem.society,
      council: inventoryItem.council,
      addedBy: inventoryItem.addedBy,
      bookedQuantity: bookedQuanitity,
      status: status,
    };
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

//Read all the Requests irrespective of user for admin
export async function ReadAllBookingItems() {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!
    );

    const itemsWithNames = await Promise.all(
      response.documents.map(async (doc) => {  
        const inventoryItem = await ReadInventoryItemById(doc.itemId);
        const start = formatDateTime(doc.start);
        const end = formatDateTime(doc.end);

        return {
          $id: doc.$id,
          itemId: doc.itemId,
          itemName: inventoryItem.itemName,
          start: start,
          end: end,
          purpose: doc.purpose,
          bookedQuantity: doc.bookedQuantity,
          requestedBy: doc.requestedUser,
          status: doc.status,
          receivedAt: (doc.receivedAt)?formatDateTime(doc.receivedAt):"not collected yet",
          returnedAt: (doc.receivedAt)? (doc.returnedAt) ? formatDateTime(doc.returnedAt): "not returned yet":"not collected yet"
        };
      })
    );

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read all booking items:", error);
    throw new Error("Failed to read all booking items");
  }
}



// Read all the Requests irrespective of user for manager

export async function ReadBookingItems() {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!
    );

    const itemsWithNames = await Promise.all(
      response.documents.filter(doc => (doc.status === "approved" || doc.status ==="issued" || doc.status === "collected")).map(async (doc) => {  // Corrected the filter syntax
        const inventoryItem = await ReadInventoryItemById(doc.itemId);
        const start = formatDateTime(doc.start);
        const end = formatDateTime(doc.end);

        return {
          $id: doc.$id,
          itemId: doc.itemId,
          itemName: inventoryItem.itemName,
          start: start,
          end: end,
          purpose: doc.purpose,
          bookedQuantity: doc.bookedQuantity,
          requestedBy: doc.requestedUser,
          status: doc.status,
        };
      })
    );

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}


// GET USER BY ID
export async function ReadUserById(userId: string) {
  console.log(userId)
  // if (userId===null)
  //   return;
  try {
    // Fetch a single inventory item by ID
    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      userId
    );

    // Map the document to the InventoryItem type
    const user = {
      $id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      email: response.email,
    };

    return user;
  } catch (error) {
    console.error("Failed to read user:", error);
    throw new Error("Failed to read user");
  }
}
// FETCH USERS BY ROLE
export async function fetchUsersByRole(role: string) {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [Query.equal("role", [role])]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw new Error("Failed to fetch users by role");
  }
}

// CREATING BOOKING REQUESTS
export async function CreateBookingRequest(formdata: FormData) {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  // EXTRACTING FORM DATA
  const itemId = formdata.get("itemId") as string;
  const item = await ReadInventoryItemById(itemId);
  const startDate = formdata.get("startDate") as string;
  const startTime = formdata.get("startTime") as string;
  const endDate = formdata.get("endDate") as string;
  const endTime = formdata.get("endTime") as string;
  const bookedQuantity = parseInt(formdata.get("bookedQuantity") as string, 10);
  const purpose = formdata.get("purpose") as string;
  const requestedTo = formdata.get("requestedTo") as string;
  const status = formdata.get("status") as string;

  // COMBINE DATE AND TIME INTO ISO STRING
  const start = new Date(`${startDate.split('-').reverse().join('-')}T${startTime}`).toISOString();
  const end = new Date(`${endDate.split('-').reverse().join('-')}T${endTime}`).toISOString();
  
  const id = ID.unique();

  try {
    // Create a new booking request in Appwrite
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, // Ensure these are set in your .env.local
      id, // Generates a unique document ID
      {
        itemId,
        start,
        end,
        purpose,
        bookedQuantity,
        requestedUser: await getUserId(user.email!), // Associate booking with the current user
        requestedTo,
        status , // Set the initial status
      }
    );
    const newAvailableQuantity = item.availableQuantity - bookedQuantity;

    // Update the item to reduce available quantity
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: newAvailableQuantity,
      }
    );

    revalidatePath(`/inventory/${itemId}`);
  } catch (error) {
    console.error("Failed to create booking request:", error);
    throw new Error("Failed to create booking request");
  }return id;
  
}

// GETTING BOOKING ITEMS BY "requestedUser" ID
export async function ReadBookingItemsByRequestedBy() {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  const userId = await getUserId(user.email!);

  try {
    // Fetch booking items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      [Query.equal("requestedUser", [userId])]
    );

    // Initialize an array to store the items with itemName
    const itemsWithNames = [];

    // Iterate over the fetched booking items
    for (const doc of response.documents) {
      // Fetch the corresponding inventory item to get the itemName
      const inventoryItem = await ReadInventoryItemById(doc.itemId);
      const start = formatDateTime(doc.start);
      const end = formatDateTime(doc.end);

      // Construct the booking item with the itemName included
      const bookingItem = {
        $id: doc.$id,
        itemId: doc.itemId,
        itemName: inventoryItem.itemName, // Adding itemName here
        start: start,
        end: end,
        purpose: doc.purpose,
        bookedQuantity: doc.bookedQuantity,
        requestedBy: doc.requestedBy,
        status: doc.status,
      };

      // Add the booking item to the array
      itemsWithNames.push(bookingItem);
    }

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}
// Reading items that are by each society

export async function ReadItemsInSociety() {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }
  const userId = await getUserId(user.email!);

  try {
    // Fetch booking items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      [Query.equal("society", [userId])]
    );

    // Initialize an array to store the items with itemName
    const itemsWithDetails = [];

    // Iterate over the fetched documents to construct the items array
    for (const doc of response.documents) {
      // Construct the inventory item with the required fields
      const inventoryItem = {
        $id: doc.$id,
        itemName: doc.itemName, // Adding itemName here
        totalQuantity: doc.totalQuantity, // Assuming these fields exist in the document
        availableQuantity: doc.availableQuantity,
        issuedQuantity: doc.totalQuantity-doc.availableQuantity - doc.damagedQuantity, // Assuming these fields exist in the document
      };

      // Add the inventory item to the array
      itemsWithDetails.push(inventoryItem);
    }

    return itemsWithDetails; // Return the array of inventory items

  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items"); // Handle the error appropriately
  }
}
//Delting the item

export async function UpdateInventoryItem(itemId: string, total: number, available: number, damaged: number){
  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: available,
        totalQuantity: total,
        damagedQuantity: damaged
      }
    );
  }
  catch (error) {
    console.error("Failed to update inventory:", error);
    throw new Error("Failed to update inventory");
  }
}

//Recieved Item from Manager - Time Update
export async function receivetimeUpdate(requestId: string, currentTime: string){
  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        receivedAt: currentTime
      }
    );
  }
  catch (error) {
    console.error("Failed to update received time:", error);
    throw new Error("Failed to update received time:");
}
}


//Returned to the Manager - Time Update
export async function returntimeUpdate(requestId: string, itemId: string, currentTime: string, bookedQuanitity: number){
  try{
    
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        returnedAt: currentTime
      }
    );

    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );
    const availableQuantity = response.availableQuantity;
    const newAvailableQuantity = availableQuantity+bookedQuanitity;
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId,
      {
        availableQuantity: newAvailableQuantity
        }
        );
  }
  catch (error) {
    console.error("Failed to update returned time:", error);
    throw new Error("Failed to update returned time:");
}
}

export async function DeleteInventoryItem(
  itemId: string,
) {
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    // Deleting the document from the Appwrite database
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );

    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      [Query.equal("itemId", [itemId])]
    );

    for (const doc of response.documents){
      await database.deleteDocument(
        process.env.DATABASE_ID!,
        process.env.BOOKINGS_COLLECTION_ID!,
        doc.$id
        );
    }

    revalidatePath(`/inventory-admin`);
  } catch (error) {
    console.error("Failed to delete booking request:", error);
    throw new Error("Failed to delete booking request");
  }
}

export async function DeleteCourtItem(
  itemId: string,
) {
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    // Deleting the document from the Appwrite database
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.COURTS_COLLECTION_ID!,
      itemId
    );

    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      [Query.equal("courtId", [itemId])]
    );

    for (const doc of response.documents){
      await database.deleteDocument(
        process.env.DATABASE_ID!,
        process.env.COURTBOOKINGS_COLLECTION_ID!,
        doc.$id
        );
    }

    revalidatePath(`/inventory-admin`);
  } catch (error) {
    console.error("Failed to delete booking request:", error);
    throw new Error("Failed to delete booking request");
  }
}

//Updataing damaged quantitiy
export async function DamagedQuantityUpdate(
  itemId: string,
  bookedQuantity: number
) {
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try{
    const damagedQuantity = bookedQuantity;
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        damagedQuantity: damagedQuantity
      }
    );
  }
  catch (error) {
    console.error("Failed to update the damaged quantity:", error);
    throw new Error("Failed to damaged quantity");
  }
}
  


// Deleting Requests that are requested by "requestedUser ID"

export async function DeleteBookingRequest(
  requestId: string,
  itemId: string,
  bookedQuantity: number
) {
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    // Deleting the document from the Appwrite database
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId
    );
    const item = await ReadInventoryItemById(itemId);
    const newAvailableQuantity = item.availableQuantity + bookedQuantity;

    // Update the item to reduce available quantity
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: newAvailableQuantity,
      }
    );

    revalidatePath(`/requests`);
  } catch (error) {
    console.error("Failed to delete booking request:", error);
    throw new Error("Failed to delete booking request");
  }
}

// Change the status to approved from booking id which will be provides

export async function ApproveBookingRequest(
  requestId: string,
  statusTo: string
) {
  try {
    // Update the status of the booking request to "approved"
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        status: statusTo,
      }
    );

    revalidatePath(`/items-requests`);
  } catch (error) {
    console.error("Failed to approve booking request:", error);
    throw new Error("Failed to approve booking request");
  }
}

// GETTING BOOKING ITEMS BY "requestedTo" ID
export async function ReadBookingItemsByRequestedTo() {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }
  const userId = await getUserId(user.email!);

  try {

    // fetch user from Appwrite
    const fetchedUser = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      userId
    )
    // Fetch booking items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      [Query.equal("requestedTo", [fetchedUser.id])]
    );


    // Initialize an array to store the items with itemName
    const itemsWithNames = [];

    // Iterate over the fetched booking items
    for (const doc of response.documents) {
      // Fetch the corresponding inventory item to get the itemName
      const inventoryItem = await ReadInventoryItemById(doc.itemId);
      const start = formatDateTime(doc.start);
      const end = formatDateTime(doc.end);

      // Construct the booking item with the itemName included
      const bookingItem = {
        $id: doc.$id,
        itemId: doc.itemId,
        itemName: inventoryItem.itemName, // Adding itemName here
        start: start,
        end: end,
        purpose: doc.purpose,
        bookedQuantity: doc.bookedQuantity,
        requestedBy: doc.requestedBy,
        status: doc.status,
      };

      // Add the booking item to the array
      itemsWithNames.push(bookingItem);
    }

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}



// ASSIGN ROLE FUNCTIONS

export const ReadAllUsers = async ({
  search = "",
  limit = 50,
  page = 1,
}: {
  search?: string;
  limit?: number;
  page?: number;
}) => {
  const offset = (page - 1) * limit;
  let queries = [];

  if (search) {
    queries.push(Query.search("firstName", search));
    queries.push(Query.search("email", search));
  }
  queries.push(Query.limit(limit));
queries.push(Query.offset(offset));

  const response = await database.listDocuments(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    queries,
  );

  return { users: response.documents as any[], total: response.total };
};


//ResetUserRole
export const ResetUserRole = async (userId: string) => {
  const user = await database.getDocument(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    userId
  );

  if (!user.originalRole) {
    user.originalRole=user.role;
  }

  user.role = user.originalRole;
  user.id = user.$id;

  await database.updateDocument(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    userId,
    {
      role: user.originalRole,
      id:user.$id,
      originalRole : user.originalRole
    }
  );
};


export const UpdateUserRole = async (
  userId: string,
  newRole: string,
) => {
  const user = await database.getDocument(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    userId
  );

  // Store original role and society if not already stored
  if (!user.originalRole) {
    user.originalRole = user.role;
  }

  // Update role and society
  user.role = newRole;

  await database.updateDocument(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    userId,
    {
      role:newRole,
      originalRole:user.originalRole
    }
  );
};

//Assign Society
export const AssignSociety = async (
  userId: string,
  societyId: string,
) => {
  const user = await database.getDocument(
    process.env.DATABASE_ID!,
    process.env.USERS_COLLECTION_ID!,
    userId
  );

  // Store original role and society if not already stored
  if (user.id===societyId) {
    return;
  }
  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      userId,
      {
        id: societyId,
      }
    );
  }catch(error){
    console.error("Failed to assign Society ", error);
    throw new Error("Failed to assign Society");
  }

  
};


/// Read All Role Users / Searched user.

export async function ReadAllUsersByRoleOrSearch(search: string)
{
  if (search !=="")
  {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [Query.equal("email", [search])]
    );

    const doc = response.documents[0];
    if (!doc)
      return undefined;
    else{
      const user = await ReadUserById(doc.id);
      const userfetched = {
        $id: doc.$id,
        id: doc.id,
        name: `${doc.firstName} ${doc.lastName}`,
        email: doc.email,
        role: doc.role,
        originalRole: (doc.originalRole)?doc.originalRole:doc.role,
        socName: `${user.firstName} ${user.lastName}`
      }
      return [userfetched];
    }
    
  }else{
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [Query.equal("role", ["Admin", "Society", "Council"])]
    );

    const fetchedusers = await Promise.all(
      response.documents.map(async (doc) => {  
        const user = await ReadUserById(doc.id);
        return{
          $id: doc.$id,
      id: doc.id,
      name: `${doc.firstName} ${doc.lastName}`,
      email: doc.email,
      role: doc.role,
      originalRole: (doc.originalRole)?doc.originalRole:doc.role,
      socName: `${user.firstName} ${user.lastName}`
        }
    }));
    return fetchedusers;
  }
}

export async function getSocietyName(userId: string){
  const user = await ReadUserById(userId);
  return `${user.firstName} ${user.lastName}`;
}

// Read Court by court id

export async function ReadCourtById(courtId: string): Promise<Models.Document | null> {
  try {
    const courts = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.COURTS_COLLECTION_ID!,
      [Query.equal("$id", [courtId])]
    );

    if (courts.total > 0) {
      return courts.documents[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching court by ID:", error);
    throw new Error("Failed to fetch court details.");
  }
}

//ReadCourtBookingsByCourtIdAndDate

export async function ReadCourtBookingsByCourtIdAndDate(
  courtId: string,
  date: string
): Promise<Models.Document[]> {
  try {
    const startOfDay = new Date(`${date}T00:00:00`).toISOString();
const endOfDay = new Date(`${date}T23:59:59`).toISOString();

const bookings = await database.listDocuments(
  process.env.DATABASE_ID!,
  process.env.COURTBOOKINGS_COLLECTION_ID!,
  [
    Query.equal("courtId", [courtId]),
    Query.greaterThanEqual("start", startOfDay),
    Query.lessThanEqual("start", endOfDay),
  ]
);



    return bookings.documents;
  } catch (error) {
    console.error("Error fetching court bookings:", error);
    throw new Error("Failed to fetch court bookings.");
  }
}

//Read user by email
export async function ReadUserByEmail(email: string): Promise<Models.Document | null> {
  try {
    const users = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [Query.equal("email", [email])]
    );

    if (users.total > 0) {
      return users.documents[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email.");
  }
}

//Creating the Court Booking Request

export async function CreateCourtRequest(data: {
  courtId: string;
  courtName: string;
  requestedUser: string;
  companions: string[];
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "05:00-06:00"
}): Promise<string> {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    redirect("/");
    return "";
  }
  const userId = await getUserId(user.email!);

  const { courtId, courtName, requestedUser, companions, date, timeSlot } = data;

  // Parse timeSlot
  const [startTime, endTime] = timeSlot.split("-");
  if (!startTime || !endTime) {
    throw new Error("Invalid time slot format.");
  }

  // Combine date and time into ISO strings
  const start = new Date(`${date}T${startTime.trim()}`).toISOString();
  const end = new Date(`${date}T${endTime.trim()}`).toISOString();
  

  const bookingId = ID.unique();
  console.log(companions);

  try {
    // Create a new court booking request in Appwrite
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      bookingId,
      {
        courtId,
        courtName,
        start,
        end,
        status: "reserved", // Initial status
        requestedUser : userId,
        companions: companions.join(","), // Array of user IDs
      }
    );

    console.log("Court booking request created successfully.");
  } catch (error) {
    console.error("Failed to create court booking request:", error);
    throw new Error("Failed to create court booking request.");
  }

  return bookingId;
}


// generate the time slots

export async function GenerateAvailableTimeSlots(
  courtId: string,
  date: string
): Promise<string[]> {
  const court: Models.Document | null = await ReadCourtById(courtId);

  if (!court) {
    throw new Error("Court not found.");
  }

  // Get day of the week
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  const courtTimeSlots: string[] = JSON.parse(court.timeSlots)[dayOfWeek];
  if (!courtTimeSlots || courtTimeSlots.length === 0) {
    return [];
  }

  // Generate all possible 30-minute interval time slots based on court's time slots
  let potentialSlots: string[] = [];

  courtTimeSlots.forEach((slot) => {
    const [start, end] = slot.split("-");
    const startDate = parseTime(start);
    const endDate = parseTime(end);

    let current = startDate;
    const maxDuration = court.maxTime * 60; // in minutes

    while (addMinutes(current, maxDuration) <= endDate) {
      const timeOnlyStart = current.toLocaleTimeString("en-US", { hour12: false });
      const timeOnlyEnd = addMinutes(current, maxDuration).toLocaleTimeString("en-US", { hour12: false });
      potentialSlots.push(`${timeOnlyStart} - ${timeOnlyEnd}`);
      current = addMinutes(current, maxDuration);
    }
  });

  // Fetch existing bookings for the court on the given date
  const existingBookings = await ReadCourtBookingsByCourtIdAndDate(courtId, date);

  // Get the current IST time
  const now = new Date();
  const currentISTTime = new Date(now.getTime() + (330 * 60 * 1000)); // IST is UTC+5:30

  // Count overlaps for each potential slot and filter out past slots
  const availableSlots: string[] = [];

  potentialSlots.forEach((potentialSlot) => {
    const [potentialStart, potentialEnd] = potentialSlot.split("-");
    const potentialStartDate = new Date(`${date}T${potentialStart}:00+05:30`).getTime();
    const potentialEndDate = new Date(`${date}T${potentialEnd}:00+05:30`).getTime();

    // Skip slots that are before the current IST time
    if (potentialStartDate < currentISTTime.getTime()) {
      return;
    }

    let overlapCount = 0;

    existingBookings.forEach((booking) => {
      const bookingStart = new Date(booking.start).getTime();
      const bookingEnd = new Date(booking.end).getTime();

      // Check if the potential slot overlaps with the existing booking
      if (potentialStartDate < bookingEnd && potentialEndDate > bookingStart) {
        overlapCount += 1;
      }
    });

    if (overlapCount < court.totalCourts) {
      availableSlots.push(potentialSlot);
    }
  });

  console.log("Details Here: ", {
    date,
    courtId,
    availableSlots,
    currentISTTime: currentISTTime.toISOString(),
  });

  return availableSlots;
}


// Helper functions
import { addMinutes, parse } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

function parseTime(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}


// Read Court Requests by requested ID
export async function ReadCourtRequestsByRequestedBy() {
  // VERIFYING USER
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }
  const userId = await getUserId(user.email!);
console.log(userId);
try {
  const bookings = await database.listDocuments(
    process.env.DATABASE_ID!,
    process.env.COURTBOOKINGS_COLLECTION_ID!,
    [
      Query.equal("status", ["reserved"])
    ]
  );
  
  const currentISTTime = new Date();
  currentISTTime.setMinutes(currentISTTime.getMinutes() + 330); // Convert UTC to IST
  
  const currentDateIST = currentISTTime.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  
  bookings.documents.forEach(async (booking) => {
    const bookingStartDate = new Date(booking.start);
    const bookingDate = bookingStartDate.toISOString().split("T")[0]; // Extract date in YYYY-MM-DD format
  
    if (
      bookingDate === currentDateIST && // Check if the booking is for today
      currentISTTime.getTime() > bookingStartDate.getTime() + 15 * 60 * 1000 // Check if the current time is more than 15 minutes late
    ) {
      await database.updateDocument(
        process.env.DATABASE_ID!,
    process.env.COURTBOOKINGS_COLLECTION_ID!,
    booking.$id,
    {
      status:"late"
    }
      )
    }
  });
  
  
} catch (error) {
  console.error("Failed to read court booking requests:", error);
  throw new Error("Failed to read court booking requests");
}


  try {
    const bookings = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      [
        
        Query.and([Query.equal("status", ["reserved", "punched-in", "late"]),
        Query.equal("requestedUser", [userId])
      ]
        ),
      ]
    );

    console.log(bookings.documents);
    return bookings.documents;
  } catch (error) {
    console.error("Failed to read court booking requests:", error);
    throw new Error("Failed to read court booking requests");
  }
}
export async function DeleteCourtBookingRequest(
  requestId: string
): Promise<void> {
  try {
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      requestId
    );

    // Optionally, you can update related court availability or perform other actions here
    console.log("Court booking request deleted successfully.");
  } catch (error) {
    console.error("Failed to delete court booking request:", error);
    throw new Error("Failed to delete court booking request.");
  }
}


export async function ReadCourtRequest(requestId: string){
  const response = await database.getDocument(
    process.env.DATABASE_ID!,
    process.env.COURTBOOKINGS_COLLECTION_ID!,
    requestId
  );
  const request = {
    $id:response.$id,
    courtName: response.courtName,
    start: response.start,
    end: response.end,
    companions:response.companions,
    status: response.status,
    requestedUser: response.requestedUser
  }
  return request;
}


export async function updateCourtRequestStatus(requestId:string) {
  try{

  
  const response = await database.getDocument(
    process.env.DATABASE_ID!,
    process.env.COURTBOOKINGS_COLLECTION_ID!,
    requestId
  );


  const status = (response.status==="reserved")? "punched-in":(response.status==="punched-in")?"punched-out":"late";
  const currentTime = new Date().toISOString();
    
  await database.updateDocument(
    process.env.DATABASE_ID!,
    process.env.COURTBOOKINGS_COLLECTION_ID!,
    requestId,
    {
      status: status
    }
  );

  if (status==="punched-in"){
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      requestId,
      {
        punchedInTime: currentTime
      }
    );
  } else if( status ==="punched-out"){
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.COURTBOOKINGS_COLLECTION_ID!,
      requestId,
      {
        punchedOutTime: currentTime
      }
    );
  }
}catch(error){
  console.error("Failed to update the status of Court Request", error);
  throw new Error("Failed to update the status of Court Request");
}

}