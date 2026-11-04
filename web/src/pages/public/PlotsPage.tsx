import React from 'react'
import PropertyBrowseView from '@/components/property/PropertyBrowseView'

export const PlotsPage: React.FC = () => {
  return (
    <PropertyBrowseView
      pageTitle="Residential Plots & Land"
      pageSubtitle="Browse approved residential plots in top gated townships, DTCP / BDA / RERA approved layouts, and scenic suburban communities to construct your dream home."
      badgeText="Clear Titles • Gated Communities"
      defaultCategory="residential_plot"
      bannerBgImage="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
      hideCategoryFilter={true}
    />
  )
}

export default PlotsPage
