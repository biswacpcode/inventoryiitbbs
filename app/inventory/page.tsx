"use client";

import { JSX, SVGProps, useEffect, useState } from "react";
import { ReadInventoryCourts, ReadInventoryItems,} from "@/lib/actions"; // Ensure the import path is correct
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Input from "@/components/ui/input"; // Make sure this component exists or replace with a standard input
import Loading from "@/components/shared/Loader";

// ---------------------DEFINING DATA TYPES---------------------
interface InventoryItem {
  $id: string;
  itemName: string;
  itemImage: string;
  totalQuantity: number;
  availableQuantity: number;
  description: string;
  society: string;
  council: string;
}

interface Court {
  $id: string;
  courtName: string;
  courtImage: string;
  location: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("items");

  // ---------------------FETCHING DATA---------------------
  useEffect(() => {
    async function fetchItems() {
      try {
        const inventoryItems = await ReadInventoryItems();
        setItems(inventoryItems || []);
      } catch (error) {
        console.error("Failed to fetch inventory items:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCourts() {
      try {
        const inventoryCourts = await ReadInventoryCourts();
        setCourts(inventoryCourts || []);
      } catch (error) {
        console.error("Failed to fetch courts:", error);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "items") {
      fetchItems();
    } else if (activeTab === "courts") {
      fetchCourts();
    }
  }, [activeTab]);

  // ---------------------FILTERING ITEMS/COURTS BASED ON SEARCH TERM---------------------
  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourts = courts.filter((court) =>
    court.courtName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  if (items.length === 0 && courts.length === 0) {
    return <p>No data found</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* ------------------------ SEARCH BOX -------------------- */}
      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder={`Search ${activeTab}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background shadow-none appearance-none pl-8"
          />
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* ------------------------ TABS -------------------- */}
      <div className="mb-6 flex space-x-4">
        <Button
          variant={activeTab === "items" ? "default" : "outline"}
          onClick={() => setActiveTab("items")}
        >
          Items
        </Button>
        <Button
          variant={activeTab === "courts" ? "default" : "outline"}
          onClick={() => setActiveTab("courts")}
        >
          Courts
        </Button>
      </div>

      {/* ------------------------ CARD GRID -------------------- */}
      {activeTab === "items" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((product) => (
              <div
                key={product.$id}
                className="bg-background rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:scale-105 border-2 border-white"
                style={{ animation: 0.3 }}
              >
                <img
                  src={product.itemImage}
                  alt={product.itemImage}
                  width={400}
                  height={300}
                  className="w-full h-60 object-cover"
                  style={{ aspectRatio: "400/300", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.itemName}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      <span className="font-medium">{product.totalQuantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>{" "}
                      <span className="font-medium">
                        {product.availableQuantity}
                      </span>
                    </div>
                  </div>
                  <Link href={`/inventory/${product.$id}`}>
                    <Button size="sm" className="mt-4 w-full">
                      Reserve
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No items match your search</p>
          )}
        </div>
      )}

      {activeTab === "courts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourts.length > 0 ? (
            filteredCourts.map((court) => (
              <div
                key={court.$id}
                className="bg-background rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:scale-105 border-2 border-white"
              >
                <img
                  src={court.courtImage}
                  alt={court.courtName}
                  width={400}
                  height={300}
                  className="w-full h-60 object-cover"
                  style={{ aspectRatio: "400/300", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{court.courtName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Location: {court.location}
                  </p>
                  <Link href={`/courts/${court.$id}`}>
                    <Button size="sm" className="mt-4 w-full">
                      Reserve
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No courts match your search</p>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
