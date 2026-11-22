import type { Property, State, City, PropertyCategory } from '@/types'

export const INDIAN_STATES: State[] = [
  { id: 1, name: 'Uttar Pradesh', code: 'UP', is_active: true },
  { id: 2, name: 'Delhi NCR', code: 'DL', is_active: true },
  { id: 3, name: 'Haryana', code: 'HR', is_active: true },
  { id: 4, name: 'Rajasthan', code: 'RJ', is_active: true },
  { id: 5, name: 'Maharashtra', code: 'MH', is_active: true },
  { id: 6, name: 'Karnataka', code: 'KA', is_active: true },
  { id: 7, name: 'Telangana', code: 'TG', is_active: true },
  { id: 8, name: 'Gujarat', code: 'GJ', is_active: true },
]

export const INDIAN_CITIES: City[] = [
  { id: 501, state_id: 1, name: 'Lucknow', is_popular: true, is_active: true },
  { id: 502, state_id: 1, name: 'Noida', is_popular: true, is_active: true },
  { id: 503, state_id: 1, name: 'Greater Noida', is_popular: true, is_active: true },
  { id: 201, state_id: 2, name: 'New Delhi', is_popular: true, is_active: true },
  { id: 301, state_id: 3, name: 'Gurugram', is_popular: true, is_active: true },
  { id: 401, state_id: 4, name: 'Jaipur', is_popular: true, is_active: true },
  { id: 601, state_id: 5, name: 'Mumbai', is_popular: true, is_active: true },
  { id: 602, state_id: 5, name: 'Pune', is_popular: true, is_active: true },
  { id: 701, state_id: 6, name: 'Bangalore', is_popular: true, is_active: true },
  { id: 801, state_id: 7, name: 'Hyderabad', is_popular: true, is_active: true },
]

export const POPULAR_LOCATIONS = [
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    count: 'Popular Plots',
    priceRange: '₹15L – ₹1.2 Cr',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Vaishali Nagar', 'Jagatpura', 'Mansarovar', 'Ajmer Road'],
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    count: 'IT Corridor Plots',
    priceRange: '₹35L – ₹3.5 Cr',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Sarjapur Road', 'Whitefield', 'Devanahalli', 'Yelahanka'],
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    count: 'Scenic Land',
    priceRange: '₹22L – ₹1.8 Cr',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Hinjewadi', 'Wagholi', 'Talegaon', 'Hadapsar'],
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    count: 'Highway Plots',
    priceRange: '₹28L – ₹2.5 Cr',
    image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Shamshabad', 'Kollur', 'Mokila', 'Adibatla'],
  },
  {
    city: 'Noida & Gr. Noida',
    state: 'Uttar Pradesh',
    count: 'Expressway Plots',
    priceRange: '₹25L – ₹2.0 Cr',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Yamuna Expressway', 'Pari Chowk', 'Sector 150', 'Greater Noida West'],
  },
]

export const CATEGORIES_CONFIG: Array<{
  category: PropertyCategory
  title: string
  subtitle: string
  count: string
  image: string
  iconName: string
}> = [
  {
    category: 'residential_plot',
    title: 'Residential Plot',
    subtitle: 'Gated townships, approved layouts for dream homes',
    count: 'Verified Listings',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
    iconName: 'Home',
  },
  {
    category: 'agricultural_land',
    title: 'Agricultural Land',
    subtitle: 'Fertile farmland, plantations, agro-forestry & orchards',
    count: 'Farmland Deals',
    image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&auto=format&fit=crop&q=80',
    iconName: 'Sprout',
  },
  {
    category: 'commercial',
    title: 'Commercial Land & SCO',
    subtitle: 'Highway plots, shopping complexes, SCO zones',
    count: 'Commercial Spaces',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    iconName: 'Building2',
  },
  {
    category: 'residential',
    title: 'Villa & House Plots',
    subtitle: 'Exclusive luxury villa plots and independent houses',
    count: 'Luxury Plots',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80',
    iconName: 'Trees',
  },
  {
    category: 'industrial',
    title: 'Industrial Land',
    subtitle: 'Manufacturing corridors, warehouse plots & logistics hubs',
    count: 'Industrial Zones',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    iconName: 'Factory',
  },
]
