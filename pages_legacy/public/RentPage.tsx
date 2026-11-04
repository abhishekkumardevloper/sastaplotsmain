'use client'
import React from 'react'
import PropertyBrowseView from '@/components/property/PropertyBrowseView'

export const RentPage: React.FC = () => {
  return (
    <PropertyBrowseView
      pageTitle="Properties & Plots for Lease & Rent"
      pageSubtitle="Explore prime commercial plots, storage yards, agricultural lease lands, and industrial spaces available for short and long-term rental."
      badgeText="Verified Rental Listings • Direct Owners"
      defaultIntent="rent"
      bannerBgImage="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80"
      hideIntentFilter={true}
    />
  )
}

export default RentPage
