import React from 'react'
import PropertyBrowseView from '@/components/property/PropertyBrowseView'

export const BuyPage: React.FC = () => {
  return (
    <PropertyBrowseView
      pageTitle="Properties & Plots for Sale"
      pageSubtitle="Discover verified residential plots, agricultural land parcels, and commercial spaces ready for purchase with transparent pricing and direct owner contacts."
      badgeText="Buy Direct • Zero Hidden Charges"
      defaultIntent="sell"
      bannerBgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
      hideIntentFilter={true}
    />
  )
}

export default BuyPage
