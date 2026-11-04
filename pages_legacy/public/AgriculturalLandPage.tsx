'use client'
import React from 'react'
import PropertyBrowseView from '@/components/property/PropertyBrowseView'

export const AgriculturalLandPage: React.FC = () => {
  return (
    <PropertyBrowseView
      pageTitle="Agricultural Land & Farm Houses"
      pageSubtitle="Explore fertile farming lands, agro-forestry plots, orchards, and weekend farm houses with water borewells, electricity, and verified 7/12 land revenue records."
      badgeText="Fertile Soil • Verified Revenue Records"
      defaultCategory="agricultural_land"
      bannerBgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80"
      hideCategoryFilter={true}
    />
  )
}

export default AgriculturalLandPage
