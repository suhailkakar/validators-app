// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import WalletDashboard from "@/components/wallet-dashboard/wallet-dashboard";

// export default function AddressExplorer() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [address, setAddress] = useState("");
//   const [submittedAddress, setSubmittedAddress] = useState("");

//   useEffect(() => {
//     // Check if there's an address in the URL
//     const urlAddress = searchParams.get("address");

//     if (urlAddress) {
//       // If address exists in URL, use it directly
//       setSubmittedAddress(urlAddress);
//       setIsModalOpen(false);
//     } else {
//       // If no address in URL, show modal
//       setIsModalOpen(true);
//     }
//   }, [searchParams]);

//   const handleContinue = () => {
//     if (address.trim()) {
//       const trimmedAddress = address.trim();
//       setSubmittedAddress(trimmedAddress);
//       setIsModalOpen(false);

//       // Update URL with the address
//       const newUrl = `/address-explorer?address=${encodeURIComponent(
//         trimmedAddress
//       )}`;
//       router.push(newUrl);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       handleContinue();
//     }
//   };

//   const handleAddressChange = (newAddress: string) => {
//     // Update URL when address changes
//     if (newAddress.trim()) {
//       const newUrl = `/address-explorer?address=${encodeURIComponent(
//         newAddress.trim()
//       )}`;
//       router.push(newUrl);
//     } else {
//       // Remove address from URL if empty
//       router.push("/address-explorer");
//     }
//   };

//   // If address is submitted, show the wallet dashboard
//   if (submittedAddress) {
//     return (
//       <WalletDashboard
//         address={submittedAddress}
//         onAddressChange={handleAddressChange}
//       />
//     );
//   }

//   // Otherwise show the address input modal
//   return (
//     <div className="flex flex-1 flex-col">
//       <div className="@container/main flex flex-1 flex-col gap-2">
//         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//           <div className="px-4 lg:px-6">
//             <h1 className="text-2xl font-bold">Address Explorer</h1>
//             <p className="text-muted-foreground mt-2">
//               Explore wallet addresses and their details
//             </p>
//           </div>

//           {/* Address Input Modal */}
//           <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>Enter Wallet Address</DialogTitle>
//                 <DialogDescription>
//                   Please enter a wallet address to explore its details.
//                 </DialogDescription>
//               </DialogHeader>
//               <Input
//                 id="address"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter wallet address..."
//               />
//               <DialogFooter>
//                 <Button onClick={handleContinue} disabled={!address.trim()}>
//                   Continue
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Address() {
  return <div>Address</div>;
}
