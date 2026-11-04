'use client'
import React from 'react'
import PropertyBrowseView from '@/components/property/PropertyBrowseView'

export const CommercialPage: React.FC = () => {
  return (
    <PropertyBrowseView
      pageTitle="Commercial Plots & Properties"
      pageSubtitle="Find high-potential commercial land, SCO plots, retail showrooms, and office spaces situated on key arterial roads and emerging business hubs."
      badgeText="High ROI Locations • Main Road Access"
      defaultCategory="commercial"
      bannerBgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
      hideCategoryFilter={true}
    />
  )
}

export default CommercialPage
