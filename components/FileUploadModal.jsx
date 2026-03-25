import { useState, useRef } from 'react'
import { FiUpload, FiX } from 'react-icons/fi'

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  fileTypes = ['*/*'], 
  title = "Upload File" 
}) => {
  const [file, setFile] = useState(null)
  const fileInputRef = useRef()

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (file) {
      onUpload(file)
      setFile(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors mb-4"
          onClick={() => fileInputRef.current.click()}
        >
          <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-gray-600">
            {file ? file.name : 'Cliquez pour sélectionner un fichier'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Types supportés: {fileTypes.join(', ')}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={fileTypes.join(',')}
            className="hidden"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`px-4 py-2 rounded-lg transition-colors ${
              file ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal