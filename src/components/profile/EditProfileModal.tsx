import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { X, Camera } from 'lucide-react';

export const EditProfileModal: React.FC = () => {
  const { currentUser, editProfileOpen, setEditProfileOpen, updateCurrentUser } = useAppStore();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  if (!editProfileOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      fullName,
      bio,
      phone,
      avatarUrl,
    });
    setEditProfileOpen(false);
  };

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h3 className="font-bold text-base text-stone-900 dark:text-white">Edit Profile</h3>
          <button
            onClick={() => setEditProfileOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700 shadow"
              />
              <button
                type="button"
                onClick={() => {
                  const newUrl = prompt('Enter image URL for avatar:', avatarUrl);
                  if (newUrl) setAvatarUrl(newUrl);
                }}
                className="absolute bottom-0 right-0 p-1 bg-emerald-800 text-white rounded-full shadow hover:bg-emerald-700 transition"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Profile Photo</p>
              <p className="text-[11px] text-stone-500">Supports HTTPS image URLs or direct photo links</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community about yourself..."
              className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditProfileOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
