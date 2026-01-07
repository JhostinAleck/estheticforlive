'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImageFromForm } from '@/lib/actions/upload'

interface ImageUploadSquareProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
}

export function ImageUploadSquare({ value, onChange, folder = 'results', label }: ImageUploadSquareProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError('')

    // Create FormData to pass File to server action
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const result = await uploadImageFromForm(formData)

    if (result.success) {
      onChange(result.url)
    } else {
      setError(result.error || 'Error al subir imagen')
    }

    setUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
        {value ? (
          <div className="relative aspect-square mb-2">
            <Image
              src={value}
              alt="Imagen"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="aspect-square flex items-center justify-center bg-surface rounded-lg mb-2 cursor-pointer hover:bg-surface/80 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted" />
            )}
          </div>
        )}

        {!value && (
          <label className="cursor-pointer">
            <span className="text-sm text-accent hover:underline">
              {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
