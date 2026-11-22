import type { Property, State, City, PropertyCategory } from '@/types'

export const MOCK_STATES: State[] = [
  { id: 1, name: 'Rajasthan', code: 'RJ', is_active: true },
  { id: 2, name: 'Maharashtra', code: 'MH', is_active: true },
  { id: 3, name: 'Karnataka', code: 'KA', is_active: true },
  { id: 4, name: 'Telangana', code: 'TG', is_active: true },
  { id: 5, name: 'Uttar Pradesh', code: 'UP', is_active: true },
  { id: 6, name: 'Gujarat', code: 'GJ', is_active: true },
  { id: 7, name: 'Haryana', code: 'HR', is_active: true },
  { id: 8, name: 'Uttarakhand', code: 'UK', is_active: true },
]

export const MOCK_CITIES: City[] = [
  { id: 101, state_id: 1, name: 'Jaipur', is_popular: true, is_active: true },
  { id: 102, state_id: 1, name: 'Jodhpur', is_popular: false, is_active: true },
  { id: 103, state_id: 1, name: 'Udaipur', is_popular: true, is_active: true },
  { id: 201, state_id: 2, name: 'Pune', is_popular: true, is_active: true },
  { id: 202, state_id: 2, name: 'Mumbai', is_popular: true, is_active: true },
  { id: 203, state_id: 2, name: 'Nagpur', is_popular: false, is_active: true },
  { id: 301, state_id: 3, name: 'Bangalore', is_popular: true, is_active: true },
  { id: 302, state_id: 3, name: 'Mysore', is_popular: false, is_active: true },
  { id: 401, state_id: 4, name: 'Hyderabad', is_popular: true, is_active: true },
  { id: 501, state_id: 5, name: 'Lucknow', is_popular: true, is_active: true },
  { id: 502, state_id: 5, name: 'Noida', is_popular: true, is_active: true },
  { id: 503, state_id: 5, name: 'Greater Noida', is_popular: true, is_active: true },
  { id: 601, state_id: 6, name: 'Ahmedabad', is_popular: true, is_active: true },
  { id: 602, state_id: 6, name: 'Surat', is_popular: false, is_active: true },
  { id: 701, state_id: 7, name: 'Gurugram', is_popular: true, is_active: true },
  { id: 801, state_id: 8, name: 'Dehradun', is_popular: true, is_active: true },
]

export const MOCK_PROPERTIES: Property[] = []

export const POPULAR_LOCATIONS = [
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    count: '280+ Plots',
    priceRange: '₹15L – ₹1.2 Cr',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Vaishali Nagar', 'Jagatpura', 'Mansarovar', 'Ajmer Road'],
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    count: '450+ Plots',
    priceRange: '₹35L – ₹3.5 Cr',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Sarjapur Road', 'Whitefield', 'Devanahalli', 'Yelahanka'],
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    count: '310+ Plots',
    priceRange: '₹22L – ₹1.8 Cr',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Hinjewadi', 'Wagholi', 'Talegaon', 'Hadapsar'],
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    count: '390+ Plots',
    priceRange: '₹28L – ₹2.5 Cr',
    image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Shamshabad', 'Kollur', 'Mokila', 'Adibatla'],
  },
  {
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    count: '220+ Plots',
    priceRange: '₹12L – ₹85L',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
    popularLocalities: ['Gomti Nagar Ext', 'Sultanpur Road', 'Raebareli Road', 'Faizabad Road'],
  },
  {
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    count: '260+ Plots',
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
    count: '1,450+ Listings',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
    iconName: 'Home',
  },
  {
    category: 'agricultural_land',
    title: 'Agricultural Land',
    subtitle: 'Fertile farmland, plantations, agro-forestry & orchards',
    count: '820+ Listings',
    image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&auto=format&fit=crop&q=80',
    iconName: 'Sprout',
  },
  {
    category: 'commercial',
    title: 'Commercial Land & SCO',
    subtitle: 'Highway plots, shopping complexes, SCO zones',
    count: '540+ Listings',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    iconName: 'Building2',
  },
  {
    category: 'residential',
    title: 'Villa & House Plots',
    subtitle: 'Exclusive luxury villa plots and independent houses',
    count: '390+ Listings',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80',
    iconName: 'Trees',
  },
  {
    category: 'industrial',
    title: 'Industrial Land',
    subtitle: 'Manufacturing corridors, warehouse plots & logistics hubs',
    count: '210+ Listings',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    iconName: 'Factory',
  },
]
