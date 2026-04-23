import { useEffect, useRef, useState } from "react";
import { Avatar, Card } from "@mui/joy";
import { toast } from "react-toastify";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import Input from "../components/input/input.component";
import { handleError } from "../utils";
import { useAppDispatch, useAppSelector } from "../data/hooks";
import { login } from "../data/reducers/userSlice";
import { selectUser } from "../data/selectors/authSelector";
import {
  useUpdateUserMutation,
  useUploadProfileImageMutation,
} from "../data/rtk/user";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  state: string;
  birthday: string;
  // description: string;
  // twitter: string;
  // instagram: string;
  // facebook: string;
  // linkedin: string;
  // tiktok: string;
  // website?: string;
};

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [updateUser] = useUpdateUserMutation();
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    state: "",
    birthday: "",
    // description: "",
    // twitter: "",
    // instagram: "",
    // facebook: "",
    // linkedin: "",
    // tiktok: "",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      address: user.address || "",
      state: user.state || "",
      birthday: user.birthday
        ? new Date(user.birthday).toISOString().slice(0, 10)
        : "",
      // description: user.description || "",
      // twitter: user.socialLinks?.twitter || "",
      // instagram: user.socialLinks?.instagram || "",
      // facebook: user.socialLinks?.facebook || "",
      // linkedin: user.socialLinks?.linkedin || "",
      // tiktok: user.socialLinks?.tiktok || "",
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  const onChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getMutationError = (error: unknown) => {
    const rtkError = error as { data?: { message?: string }; message?: string };
    return rtkError?.data?.message || rtkError?.message || "Request failed";
  };

  const clearSelectedAvatar = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl("");
    setSelectedAvatarFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSelectAvatar = (file?: File) => {
    if (!file) return;

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarPreviewUrl(URL.createObjectURL(file));
    setSelectedAvatarFile(file);
  };

  const handleSave = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      // Upload avatar if selected (let axios auto-detect FormData and set proper boundary)
      if (selectedAvatarFile) {
        setUploading(true);
        await uploadProfileImage(selectedAvatarFile).unwrap();
        setUploading(false);
      }

      // Update profile fields
      const updateRes = await updateUser({
        id: user._id,
        body: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
          state: form.state,
          birthday: form.birthday || undefined,
          // description: form.description,
          // socialLinks: {
          //   twitter: form.twitter,
          //   instagram: form.instagram,
          //   facebook: form.facebook,
          //   linkedin: form.linkedin,
          //   website: form.website,
          //   tiktok: form.tiktok,
          // },
        },
      }).unwrap();

      if (updateRes?.data) {
        dispatch(login({ user: updateRes.data }));
        clearSelectedAvatar();
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      const errorMsg = getMutationError(error) || handleError(error);
      console.error("Profile update error:", errorMsg);
      toast.error(errorMsg || "Failed to update profile");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // const isStudent = user?.type === "user";

  return (
    <Frame text="Profile">
      <div className="mt-6 pb-16">
        <Card variant="outlined">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Sidebar - Avatar */}
            <div className="flex flex-col items-center">
              <Avatar
                src={avatarPreviewUrl || user?.avatar?.url || ""}
                size="lg"
                sx={{ width: 120, height: 120, marginBottom: 2 }}
              >
                {initials}
              </Avatar>
              <label className="w-full">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSelectAvatar(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full px-3 py-2 bg-gray-100 rounded border border-[#CBD5E1] text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  disabled={uploading}
                >
                  Choose File
                </button>
              </label>
              <p className="mt-2 text-xs text-gray-500 text-center break-all">
                {selectedAvatarFile
                  ? selectedAvatarFile.name
                  : "No file chosen"}
              </p>
              <button
                type="button"
                className="mt-2 text-sm text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={clearSelectedAvatar}
                disabled={
                  uploading || (!selectedAvatarFile && !avatarPreviewUrl)
                }
              >
                Remove
              </button>
            </div>

            {/* Right Side - Form Fields */}
            <div className="md:col-span-3 space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => onChange("firstName", e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => onChange("lastName", e.target.value)}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full h-10 border border-[#CBD5E1] rounded-md px-3 mt-1 bg-gray-50 text-gray-500 outline-none"
                />
              </div>

              {/* Phone and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
                <Input
                  label="State"
                  value={form.state}
                  placeholder="e.g. Lagos"
                  onChange={(e) => onChange("state", e.target.value)}
                />
              </div>

              {/* Birthday */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#001F54] font-medium">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => onChange("birthday", e.target.value)}
                    className="w-full h-10 border border-[#CBD5E1] rounded-md px-3 mt-1 outline-none focus:border-[#001EC5]"
                  />
                </div>
              </div>

              {/* Bio (temporarily disabled) */}
              {/*
              <div>
                <label className="text-sm text-[#001F54] font-medium">
                  Bio
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  rows={4}
                  className="w-full border border-[#CBD5E1] rounded-md p-3 mt-1 outline-none focus:border-[#001EC5]"
                  placeholder="Write a short bio about yourself"
                />
              </div>
              */}

              {/* Social Links - temporarily disabled */}
              {/*
              {isStudent && (
                <>
                  <Typography
                    level="title-md"
                    sx={{ mt: 2, mb: 1, color: "#001F54" }}
                  >
                    Social Links
                  </Typography>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Facebook"
                      value={form.facebook}
                      placeholder="https://facebook.com/..."
                      onChange={(e) => onChange("facebook", e.target.value)}
                    />
                    <Input
                      label="Instagram"
                      value={form.instagram}
                      placeholder="https://instagram.com/..."
                      onChange={(e) => onChange("instagram", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Twitter/X"
                      value={form.twitter}
                      placeholder="https://x.com/..."
                      onChange={(e) => onChange("twitter", e.target.value)}
                    />
                    <Input
                      label="LinkedIn"
                      value={form.linkedin}
                      placeholder="https://linkedin.com/in/..."
                      onChange={(e) => onChange("linkedin", e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Website"
                      value={form.website}
                      placeholder="https://example.com"
                      onChange={(e) => onChange("website", e.target.value)}
                    />
                  </div>
                </>
              )}
              */}

              {/* Footer text */}
              <p className="text-sm text-gray-500 mt-4">
                Update your personal details and links.
              </p>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <AppButton
                  type="button"
                  loading={loading}
                  disabled={loading}
                  onClick={handleSave}
                >
                  Save Changes
                </AppButton>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Frame>
  );
};

export default ProfilePage;
