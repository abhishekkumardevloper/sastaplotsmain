'use client'
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      navigate(`/dashboard/add-property?edit=${id}`, { replace: true })
    } else {
      navigate('/dashboard/listings', { replace: true })
    }
  }, [id, navigate])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-orange border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading property editor...</p>
      </div>
    </div>
  )
}
