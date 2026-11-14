export const STORE = {
  name: "Awad Trading",
  owner: "Mr. John",
  whatsappNumber: "916377596085",
  phone: "+91 9000000000",
  alternatePhone: "+91 8000000000",
  upiId: "demo@upi",
  /** Published Google Sheet CSV link or JSON file URL. Leave empty to use the bundled data/products.ts. See docs/OWNER_GUIDE.md. */
  catalogUrl: "",
  address: "Sample Address, Kolkata, India",
  deliveryAddress: "Santosh Nagar",
  deliveryPromise: "20–30 mins",
  timings: "Mon–Sat · 7:00 AM – 9:00 PM\nSunday · 8:00 AM – 2:00 PM",
  delivery:
    "Free delivery on orders of ₹999 and above within 5 km radius.\nDelivery fee ₹40 below that.\nMinimum order · ₹500\nDelivery time · Same day or next morning.",
  established: "April 2024",
  /** Pincodes we deliver to. Replace with the real service area. */
  servicePincodes: ["700001", "700002", "700003"],
  closedDays: [] as number[],
  maxDaysAhead: 2,
  deliverySlots: [
    { id: "morning", label: "Morning 9 AM - 12 PM", start: "09:00", cutoffMinutes: 60 },
    { id: "afternoon", label: "Afternoon 12 - 4 PM", start: "12:00", cutoffMinutes: 60 },
    { id: "evening", label: "Evening 5 - 8 PM", start: "17:00", cutoffMinutes: 60, days: [1, 2, 3, 4, 5, 6] },
  ],
  minOrder: 500,
  freeDeliveryAbove: 999,
  deliveryFee: 40,
} as const;
