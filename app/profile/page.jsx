// app/profile/page.jsx
'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { FiEdit, FiUpload, FiCheck, FiUser, FiBriefcase, FiBook, FiAward } from 'react-icons/fi'
import { motion } from 'framer-motion'
import ProfileHeader from '@/components/ProfileHeader'
import FileUploadModal from '@/components/FileUploadModal'
import Link from 'next/link'

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile, fetchFullProfile, API_URL } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadType, setUploadType] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        ...(user.profile_data || {})
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setIsEditing(false)
      // Pas besoin de fetchFullProfile car updateProfile le fait déjà
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleFileUpload = async (file, fieldName) => {
    try {
      const formData = new FormData()
      formData.append(fieldName, file)
      await updateProfile({}, { [fieldName]: file })
      setIsUploadModalOpen(false)
      await fetchFullProfile()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Connectez-vous pour accéder à votre profil</h2>
          <Link href="/login">
            <button className="px-6 py-3 bg-linear-to-r/srgb from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    )
  }
  // Ajoutez ces constantes en haut du fichier
const EDUCATION_LEVELS = [
  { value: 'bac', label: 'Bac' },
  { value: 'bac+1', label: 'Bac+1' },
  { value: 'bac+2', label: 'Bac+2' },
  { value: 'bac+3', label: 'Bac+3' },
  { value: 'bac+4', label: 'Bac+4' },
  { value: 'bac+5', label: 'Bac+5' },
  { value: 'doctorat', label: 'Doctorat' }
]

const MATURITY_STAGES = [
  { value: 'idée', label: 'Idée' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'mvp', label: 'MVP' },
  { value: 'commercialisation', label: 'Commercialisation' },
  { value: 'croissance', label: 'Croissance' },
  { value: 'scale-up', label: 'Scale-up' }
]

// Modifiez la fonction renderProfileContent comme suit :
const renderProfileContent = () => {
  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6">
          <ProfileSection title="Informations personnelles" icon={<FiUser />}>
            <InfoRow label="Nom complet" value={`${user.first_name} ${user.last_name}`} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Type de profil" value={
              user.profile_type === 'student' ? 'Étudiant' :
              user.profile_type === 'startup' ? 'Startup' :
              user.profile_type === 'corporate' ? 'Entreprise' :
              'Investisseur'
            } />
          </ProfileSection>

          {user.profile_type === 'student' && (
            <ProfileSection title="Informations académiques" icon={<FiBook />}>
              <InfoRow label="Établissement" value={user.profile_data?.institution} />
              <InfoRow label="Niveau d'études" value={
                EDUCATION_LEVELS.find(l => l.value === user.profile_data?.education_level)?.label
              } />
              <InfoRow label="Secteur" value={user.profile_data?.sector} />
              <InfoRow label="Motivations" value={user.profile_data?.motivations} />
              <InfoRow label="Centres d'intérêt" value={user.profile_data?.interests} />
            </ProfileSection>
          )}

          {user.profile_type === 'startup' && (
            <ProfileSection title="Informations de la startup" icon={<FiBriefcase />}>
              <InfoRow label="Nom de l'entreprise" value={user.profile_data?.company_name} />
              <InfoRow label="Secteur" value={user.profile_data?.company_sector} />
              <InfoRow label="Localisation" value={user.profile_data?.location} />
              <InfoRow label="Proposition de valeur" value={user.profile_data?.value_proposition} />
              <InfoRow label="Stade de maturité" value={
                MATURITY_STAGES.find(s => s.value === user.profile_data?.maturity_stage)?.label
              } />
              <InfoRow label="Équipe fondatrice" value={user.profile_data?.founding_team} />
              <InfoRow label="Besoins" value={user.profile_data?.needs} />
            </ProfileSection>
          )}

          {(user.profile_type === 'corporate' || user.profile_type === 'investor') && (
            <ProfileSection title="Informations professionnelles" icon={<FiBriefcase />}>
              <InfoRow label="Nom de l'organisation" value={user.profile_data?.organization_name} />
              <InfoRow label="Activités" value={user.profile_data?.activities} />
              <InfoRow label="Secteurs d'intérêt" value={user.profile_data?.interest_sectors} />
              <InfoRow label="Objectifs de coopération" value={user.profile_data?.cooperation_objectives} />
            </ProfileSection>
          )}
        </div>
      )

    case 'edit':
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Prénom"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleInputChange}
            />
            <FormInput
              label="Nom"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleInputChange}
            />

            {user.profile_type === 'student' && (
              <>
                <FormInput
                  label="Établissement"
                  name="institution"
                  value={formData.institution || ''}
                  onChange={handleInputChange}
                />
                <FormSelect
                  label="Niveau d'études"
                  name="education_level"
                  value={formData.education_level || ''}
                  onChange={handleInputChange}
                  options={EDUCATION_LEVELS}
                />
                <FormInput
                  label="Secteur"
                  name="sector"
                  value={formData.sector || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Motivations"
                  name="motivations"
                  value={formData.motivations || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Centres d'intérêt"
                  name="interests"
                  value={formData.interests || ''}
                  onChange={handleInputChange}
                />
              </>
            )}

            {user.profile_type === 'startup' && (
              <>
                <FormInput
                  label="Nom de l'entreprise"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Secteur d'activité"
                  name="company_sector"
                  value={formData.company_sector || ''}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Localisation"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Proposition de valeur"
                  name="value_proposition"
                  value={formData.value_proposition || ''}
                  onChange={handleInputChange}
                />
                <FormSelect
                  label="Stade de maturité"
                  name="maturity_stage"
                  value={formData.maturity_stage || ''}
                  onChange={handleInputChange}
                  options={MATURITY_STAGES}
                />
                <FormTextarea
                  label="Équipe fondatrice"
                  name="founding_team"
                  value={formData.founding_team || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Besoins"
                  name="needs"
                  value={formData.needs || ''}
                  onChange={handleInputChange}
                />
              </>
            )}

            {(user.profile_type === 'corporate' || user.profile_type === 'investor') && (
              <>
                <FormInput
                  label="Nom de l'organisation"
                  name="organization_name"
                  value={formData.organization_name || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Activités"
                  name="activities"
                  value={formData.activities || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Secteurs d'intérêt"
                  name="interest_sectors"
                  value={formData.interest_sectors || ''}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Objectifs de coopération"
                  name="cooperation_objectives"
                  value={formData.cooperation_objectives || ''}
                  onChange={handleInputChange}
                />
              </>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium shadow hover:bg-orange-600 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )

    case 'documents':
      return (
        <div className="space-y-6">
          {user.profile_type === 'student' && (
            <>
              <DocumentCard 
                title="CV"
                fileData={user.profile_data?.cv_file}
                onUpload={() => {
                  setUploadType('cv_file')
                  setIsUploadModalOpen(true)
                }}
                apiUrl={API_URL}
              />
              <DocumentCard 
                title="Lettre de motivation"
                fileData={user.profile_data?.cover_letter_file}
                onUpload={() => {
                  setUploadType('cover_letter_file')
                  setIsUploadModalOpen(true)
                }}
                apiUrl={API_URL}
              />
            </>
          )}
          
          {user.profile_type === 'startup' && (
            <>
              <DocumentCard 
                title="Logo"
                fileData={user.profile_data?.logo_file}
                onUpload={() => {
                  setUploadType('logo_file')
                  setIsUploadModalOpen(true)
                }}
                apiUrl={API_URL}
              />
              <DocumentCard 
                title="Pitch Deck"
                fileData={user.profile_data?.pitch_deck_file}
                onUpload={() => {
                  setUploadType('pitch_deck_file')
                  setIsUploadModalOpen(true)
                }}
                apiUrl={API_URL}
              />
              <DocumentCard 
                title="Business Plan"
                fileData={user.profile_data?.business_plan_file}
                onUpload={() => {
                  setUploadType('business_plan_file')
                  setIsUploadModalOpen(true)
                }}
                apiUrl={API_URL}
              />
            </>
          )}
        </div>
      )
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader 
        user={user} 
        onEditAvatar={() => {
          setUploadType('profile_picture')
          setIsUploadModalOpen(true)
        }}
        apiUrl={API_URL}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                <TabButton 
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  icon={<FiUser />}
                >
                  Aperçu
                </TabButton>
                <TabButton 
                  active={activeTab === 'edit'}
                  onClick={() => {
                    setActiveTab('edit')
                    setIsEditing(true)
                  }}
                  icon={<FiEdit />}
                >
                  Modifier le profil
                </TabButton>
                <TabButton 
                  active={activeTab === 'documents'}
                  onClick={() => setActiveTab('documents')}
                  icon={<FiAward />}
                >
                  Documents
                </TabButton>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              {renderProfileContent()}
            </motion.div>
          </div>
        </div>
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(file) => handleFileUpload(file, uploadType)}
        fileTypes={uploadType === 'profile_picture' ? ['image/*'] : ['application/pdf']}
        title={`Upload ${uploadType.replace('_', ' ')}`}
      />
    </div>
  )
}

// Components
const ProfileSection = ({ title, icon, children }) => (
  <div className="border-b border-gray-100 pb-6">
    <div className="flex items-center mb-4">
      <div className="p-2 rounded-full bg-orange-50 mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-1 md:grid-cols-3">
    <span className="text-gray-500">{label}</span>
    <span className="md:col-span-2 font-medium">{value || 'Non renseigné'}</span>
  </div>
)

const TabButton = ({ children, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${active ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
  >
    <span className="mr-3">{icon}</span>
    {children}
  </button>
)

const DocumentCard = ({ title, fileData, onUpload, apiUrl }) => {
  const fileUrl = fileData?.path 
    ? `${apiUrl}/${fileData.path.startsWith('uploads/') ? fileData.path : 'uploads/' + fileData.path}`
    : null

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{title}</h4>
          {fileData ? (
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline text-sm"
            >
              {fileData.filename} ({Math.round(fileData.size / 1024)} KB)
            </a>
          ) : (
            <p className="text-sm text-gray-500">Aucun document</p>
          )}
        </div>
        <button
          onClick={onUpload}
          className="flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
        >
          <FiUpload className="mr-2" size={14} />
          {fileData ? 'Remplacer' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}
// Composant FormInput
const FormInput = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
)

// Composant FormSelect
const FormSelect = ({ label, name, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

// Composant FormTextarea
const FormTextarea = ({ label, name, value, onChange, rows = 3 }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
)
export default ProfilePage
