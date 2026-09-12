import React, { useState } from 'react';
import { X, Camera, Upload, Check } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&h=256&q=80',
];

export const EditProfileModal: React.FC = () => {
  const { isEditProfileOpen, setIsEditProfileOpen, currentUser, updateCurrentUser } = useSocial();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [banner, setBanner] = useState(currentUser.banner);

  if (!isEditProfileOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBanner(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      location: location.trim() || undefined,
      website: website.trim() || undefined,
      avatar,
      banner,
    });
    setIsEditProfileOpen(false);
  };

  return (
    <div
      id="edit-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsEditProfileOpen(false)}
    >
      <div
        id="edit-profile-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900 text-base">Edit Profile</h3>
          <button
            id="btn-close-edit-profile"
            onClick={() => setIsEditProfileOpen(false)}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Banner & Avatar Pickers */}
          <div className="relative mb-6">
            <div className="h-28 rounded-xl bg-zinc-200 overflow-hidden relative group">
              <img src={banner} alt="Banner" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-xs font-semibold gap-1.5 transition-opacity">
                <Camera className="w-4 h-4" />
                Change Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative -mt-10 ml-4 inline-block group">
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-zinc-200"
              />
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white transition-opacity">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Avatar Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Preset Avatars
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(p)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    avatar === p ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-zinc-50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-zinc-50 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-zinc-50"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Website
            </label>
            <input
              type="url"
              placeholder="https://yoursite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-zinc-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-profile"
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
