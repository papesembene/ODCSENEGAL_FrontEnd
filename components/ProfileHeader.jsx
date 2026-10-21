import { FiCamera } from 'react-icons/fi'

const ProfileHeader = ({ user, onEditAvatar, apiUrl }) => {
  const getAvatarUrl = () => {
    if (!user.profile_picture) return null
    if (user.profile_picture.startsWith('http')) return user.profile_picture
    // Prepend API_URL and ensure uploads/ is present
    const path = user.profile_picture.startsWith('uploads/')
      ? user.profile_picture
      : 'uploads/' + user.profile_picture
    return `${apiUrl}/${path}`
  }

  const avatarUrl = getAvatarUrl()

  return (
    <div className="relative bg-linear-to-r/srgb from-orange-400 to-orange-600 h-48">
      <div className="absolute -bottom-16 left-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-4xl">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
            )}
          </div>
          <button
            onClick={onEditAvatar}
            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiCamera className="text-orange-500" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 left-48">
        <h1 className="text-2xl font-bold text-white">
          {user.first_name} {user.last_name}
        </h1>
        <p className="text-orange-100">
          {user.profile_type === 'student' && 'Étudiant'}
          {user.profile_type === 'startup' && 'Startup'}
          {user.profile_type === 'corporate' && 'Entreprise'}
        </p>
      </div>
    </div>
  )
}

export default ProfileHeader
