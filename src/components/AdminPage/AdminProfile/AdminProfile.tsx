"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/redux/features/auth/profileApi";
import { Camera, Loader2, Mail, Phone, RefreshCw, Lock, Eye, EyeOff } from "lucide-react";
import { LiaUserEditSolid } from "react-icons/lia";

import { toast } from "sonner";
import { ProfileUpdatePayload } from "@/redux/types/venue.type";
import { Label } from "@/components/ui/label";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PageLoader from "../Shared/PageLoader";

const AdminProfile = () => {
  const { data: profile, isLoading, isError, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Initialize form when profile loads or dialog opens
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });
      if (profile.photo) {
        setPreviewImage(profile.photo);
      }
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload: ProfileUpdatePayload = {
        ...(formData.fullName !== profile?.fullName && {
          fullName: formData.fullName,
        }),
        ...(formData.phoneNumber !== profile?.phoneNumber && {
          phoneNumber: formData.phoneNumber,
        }),
        ...(selectedFile && { file: selectedFile }),
      };

      await updateProfile(payload).unwrap();
      toast.success("Profile updated successfully");
      setIsDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
      console.error("Failed to change password:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Error loading profile: {error?.toString()}
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6">No profile data found</div>;
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm px-8 py-6 relative border border-gray-100 transition-all hover:shadow-md">
      {/* Edit Icon */}
      <div className="absolute top-5 right-5">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-lg border border-gray-200 shadow-xs cursor-pointer transition-all hover:bg-gray-50 hover:shadow-sm group"
              aria-label="Edit Profile"
            >
              <LiaUserEditSolid className="h-5 w-5 text-[#156EF0] group-hover:text-[#0B4DB8] transition-colors duration-200" />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[540px] rounded-lg backdrop-blur-sm">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Update Profile
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-offset-2 ring-blue-500/20">
                  <Image
                    src={previewImage || profile.photo || "/default-avatar.png"}
                    alt="Profile Preview"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                  {selectedFile && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                  disabled={isUpdating}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-gray-700 font-medium"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="focus-visible:ring-blue-500"
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-semibold"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    className="bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-gray-700 font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="focus-visible:ring-blue-500"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            <AlertDialogFooter className="mt-6">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedFile(null);
                  setPreviewImage(profile.photo || null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={
                  isUpdating ||
                  (!selectedFile &&
                    formData.fullName === profile.fullName &&
                    formData.phoneNumber === profile.phoneNumber)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </AlertDialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile Layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:items-start w-full md:w-auto space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-500/30">
            <Image
              src={previewImage || profile.photo || "/default-avatar.png"}
              alt="Profile"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              {profile.fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1"> Role: {profile.role}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm text-gray-500 font-semibold">Email</h3>
            </div>
            <p className="text-gray-900">{profile.email}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm text-gray-500 font-semibold">Phone</h3>
            </div>
            <p className="text-gray-900">
              {profile.phoneNumber || "Not provided"}
            </p>
          </div>

          {/* Change Password Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm text-gray-500 font-semibold">Password</h3>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-lg">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Change Password
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="oldPassword"
                        className="text-gray-700 font-medium"
                      >
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showPasswords.oldPassword ? "text" : "password"}
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              oldPassword: e.target.value,
                            }))
                          }
                          className="focus-visible:ring-blue-500 pr-10"
                          disabled={isChangingPassword}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              oldPassword: !prev.oldPassword,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          disabled={isChangingPassword}
                        >
                          {showPasswords.oldPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="newPassword"
                        className="text-gray-700 font-medium"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.newPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="focus-visible:ring-blue-500 pr-10"
                          disabled={isChangingPassword}
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              newPassword: !prev.newPassword,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          disabled={isChangingPassword}
                        >
                          {showPasswords.newPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700 font-medium"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="focus-visible:ring-blue-500 pr-10"
                          disabled={isChangingPassword}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirmPassword: !prev.confirmPassword,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          disabled={isChangingPassword}
                        >
                          {showPasswords.confirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AlertDialogFooter className="mt-6">
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        setIsPasswordDialogOpen(false);
                        setPasswordData({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setShowPasswords({
                          oldPassword: false,
                          newPassword: false,
                          confirmPassword: false,
                        });
                      }}
                      disabled={isChangingPassword}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        isChangingPassword ||
                        !passwordData.oldPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Subscription Section */}
          {profile.subscriptions && profile.subscriptions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Subscription
              </h3>
              <div className="space-y-4">
                {profile.subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">
                          User ID
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.userId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">
                          Plan ID
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.planId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">
                          Start Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(subscription.startDate), "PPpp")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">
                          End Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(subscription.endDate), "PPpp")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge
                        variant={
                          new Date(subscription.endDate) > new Date()
                            ? "default"
                            : "destructive"
                        }
                      >
                        {new Date(subscription.endDate) > new Date()
                          ? "Active"
                          : "Expired"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";

// const AdminProfile: React.FC = () => {
//   const [adminData, setAdminData] = useState({
//     name: "Michael Johnson",
//     email: "michael.johnson@adminusa.com",
//     photo: "https://i.pravatar.cc/150?img=3",
//     role: "Administrator",
//     phone: "(555) 123-4567",
//     address: "123 Main St, Los Angeles, CA 90001, USA",
//   });

//   const [formData, setFormData] = useState(adminData);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUpdate = () => {
//     setAdminData(formData);
//     setIsDialogOpen(false);
//   };

//   return (
//     <div className="w-full mx-auto p-6 bg-white rounded-xl shadow-md">
//       <div className="flex flex-col items-center space-y-4">
//         <Image
//           src={adminData.photo}
//           alt="Admin"
//           width={100}
//           height={100}
//           className="rounded-full object-cover"
//         />
//         <div className="text-center space-y-1">
//           <h2 className="text-xl font-semibold text-gray-900">
//             {adminData.name}
//           </h2>
//           <p className="text-sm text-gray-600">{adminData.email}</p>
//           <p className="text-sm text-gray-500">Role: {adminData.role}</p>
//           <p className="text-sm text-gray-500">Phone: {adminData.phone}</p>
//           <p className="text-sm text-gray-500">Address: {adminData.address}</p>
//         </div>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button
//               variant="outline"
//               onClick={() => setIsDialogOpen(true)}
//               className="text-[#003366] border-[#003366] cursor-pointer"
//             >
//               Edit Profile
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="sm:max-w-[500px] bg-white rounded-lg">
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold text-[#1D1B28]">
//                 Update Profile
//               </DialogTitle>
//               <DialogDescription>Edit your profile details.</DialogDescription>
//             </DialogHeader>

//             <div className="grid gap-4 py-4">
//               {(
//                 ["name", "email", "photo", "role", "phone", "address"] as Array<
//                   keyof typeof formData
//                 >
//               ).map((field) => (
//                 <div
//                   key={field}
//                   className="grid grid-cols-4 items-center gap-4"
//                 >
//                   <label htmlFor={field} className="text-right capitalize">
//                     {field}
//                   </label>
//                   <Input
//                     id={field}
//                     name={field}
//                     value={formData[field]}
//                     onChange={handleChange}
//                     className="col-span-3"
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsDialogOpen(false)}
//                 className="text-[#003366] border-[#003366] cursor-pointer"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleUpdate}
//                 className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//               >
//                 Save Changes
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default AdminProfile;
