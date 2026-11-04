'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Search,
  Building2,
  Compass,
  ArrowRight,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'

interface LocationCity {
  id: number
  name: string
  is_popular?: boolean
  property_count?: number
}

interface StateWithCities {
  id: number
  name: string
  code: string
  cities: LocationCity[]
}

// Complete fallback Indian locations based on project schema
const FALLBACK_STATE_DATA: StateWithCities[] = [
  {
    id: 5,
    name: 'Delhi',
    code: 'DL',
    cities: [
      { id: 707, name: 'Delhi', is_popular: true, property_count: 85 },
      { id: 708, name: 'New Delhi', is_popular: true, property_count: 42 },
    ],
  },
  {
    id: 14,
    name: 'Maharashtra',
    code: 'MH',
    cities: [
      { id: 709, name: 'Mumbai', is_popular: true, property_count: 120 },
      { id: 710, name: 'Pune', is_popular: true, property_count: 94 },
      { id: 711, name: 'Nagpur', is_popular: false, property_count: 36 },
      { id: 712, name: 'Nashik', is_popular: false, property_count: 28 },
      { id: 751, name: 'Thane', is_popular: false, property_count: 45 },
      { id: 752, name: 'Navi Mumbai', is_popular: true, property_count: 67 },
    ],
  },
  {
    id: 11,
    name: 'Karnataka',
    code: 'KA',
    cities: [
      { id: 713, name: 'Bengaluru', is_popular: true, property_count: 156 },
      { id: 714, name: 'Mysuru', is_popular: false, property_count: 32 },
      { id: 753, name: 'Mangaluru', is_popular: false, property_count: 19 },
      { id: 754, name: 'Hubballi', is_popular: false, property_count: 14 },
    ],
  },
  {
    id: 23,
    name: 'Tamil Nadu',
    code: 'TN',
    cities: [
      { id: 715, name: 'Chennai', is_popular: true, property_count: 88 },
      { id: 716, name: 'Coimbatore', is_popular: false, property_count: 41 },
      { id: 755, name: 'Madurai', is_popular: false, property_count: 22 },
    ],
  },
  {
    id: 24,
    name: 'Telangana',
    code: 'TG',
    cities: [
      { id: 717, name: 'Hyderabad', is_popular: true, property_count: 112 },
      { id: 756, name: 'Warangal', is_popular: false, property_count: 18 },
    ],
  },
  {
    id: 21,
    name: 'Rajasthan',
    code: 'RJ',
    cities: [
      { id: 718, name: 'Jaipur', is_popular: true, property_count: 73 },
      { id: 719, name: 'Jodhpur', is_popular: false, property_count: 26 },
      { id: 720, name: 'Udaipur', is_popular: false, property_count: 21 },
      { id: 757, name: 'Kota', is_popular: false, property_count: 16 },
    ],
  },
  {
    id: 7,
    name: 'Gujarat',
    code: 'GJ',
    cities: [
      { id: 721, name: 'Ahmedabad', is_popular: true, property_count: 79 },
      { id: 722, name: 'Surat', is_popular: false, property_count: 38 },
      { id: 723, name: 'Vadodara', is_popular: false, property_count: 30 },
      { id: 758, name: 'Rajkot', is_popular: false, property_count: 17 },
    ],
  },
  {
    id: 26,
    name: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      { id: 724, name: 'Lucknow', is_popular: true, property_count: 82 },
      { id: 725, name: 'Noida', is_popular: true, property_count: 110 },
      { id: 726, name: 'Agra', is_popular: false, property_count: 24 },
      { id: 727, name: 'Kanpur', is_popular: false, property_count: 29 },
      { id: 728, name: 'Varanasi', is_popular: false, property_count: 31 },
      { id: 759, name: 'Greater Noida', is_popular: true, property_count: 65 },
      { id: 760, name: 'Ghaziabad', is_popular: false, property_count: 48 },
    ],
  },
  {
    id: 8,
    name: 'Haryana',
    code: 'HR',
    cities: [
      { id: 729, name: 'Gurgaon', is_popular: true, property_count: 98 },
      { id: 730, name: 'Faridabad', is_popular: false, property_count: 35 },
      { id: 761, name: 'Panipat', is_popular: false, property_count: 15 },
      { id: 762, name: 'Sonipat', is_popular: false, property_count: 20 },
    ],
  },
  {
    id: 28,
    name: 'West Bengal',
    code: 'WB',
    cities: [
      { id: 731, name: 'Kolkata', is_popular: true, property_count: 64 },
      { id: 763, name: 'Siliguri', is_popular: false, property_count: 23 },
    ],
  },
  {
    id: 20,
    name: 'Punjab',
    code: 'PB',
    cities: [
      { id: 732, name: 'Amritsar', is_popular: false, property_count: 19 },
      { id: 733, name: 'Ludhiana', is_popular: false, property_count: 27 },
      { id: 764, name: 'Mohali', is_popular: true, property_count: 44 },
    ],
  },
  {
    id: 13,
    name: 'Madhya Pradesh',
    code: 'MP',
    cities: [
      { id: 734, name: 'Bhopal', is_popular: false, property_count: 33 },
      { id: 735, name: 'Indore', is_popular: true, property_count: 58 },
      { id: 765, name: 'Gwalior', is_popular: false, property_count: 16 },
    ],
  },
  {
    id: 12,
    name: 'Kerala',
    code: 'KL',
    cities: [
      { id: 736, name: 'Kochi', is_popular: false, property_count: 36 },
      { id: 737, name: 'Thiruvananthapuram', is_popular: false, property_count: 28 },
    ],
  },
  {
    id: 27,
    name: 'Uttarakhand',
    code: 'UK',
    cities: [
      { id: 766, name: 'Dehradun', is_popular: true, property_count: 49 },
      { id: 767, name: 'Haridwar', is_popular: false, property_count: 21 },
      { id: 768, name: 'Rishikesh', is_popular: false, property_count: 18 },
    ],
  },
  {
    id: 9,
    name: 'Himachal Pradesh',
    code: 'HP',
    cities: [
      { id: 769, name: 'Shimla', is_popular: false, property_count: 14 },
      { id: 770, name: 'Dharamshala', is_popular: false, property_count: 12 },
    ],
  },
  {
    id: 6,
    name: 'Goa',
    code: 'GA',
    cities: [
      { id: 771, name: 'North Goa', is_popular: true, property_count: 37 },
      { id: 772, name: 'South Goa', is_popular: false, property_count: 25 },
    ],
  },
]

export const AllLocationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<StateWithCities[]>(FALLBACK_STATE_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Fetch live locations from API if available
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations/states')
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          // Check if data contains cities array
          if (data[0].cities) {
            setLocations(data)
          }
        }
      } catch {
        // Fallback data is already present
      }
    }
    fetchLocations()
  }, [])

  // Filtered state and cities based on search & filter
  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return locations
      .filter((state) => {
        if (selectedStateFilter !== 'all' && state.name !== selectedStateFilter) {
          return false
        }
        return true
      })
      .map((state) => {
        if (!query) return state

        const stateMatches = state.name.toLowerCase().includes(query)
        const matchingCities = state.cities.filter((city) =>
          city.name.toLowerCase().includes(query)
        )

        if (stateMatches) return state
        if (matchingCities.length > 0) {
          return { ...state, cities: matchingCities }
        }
        return null
      })
      .filter((state): state is StateWithCities => state !== null && state.cities.length > 0)
  }, [locations, searchQuery, selectedStateFilter])

  // Extract popular cities for top highlight banner
  const popularCities = useMemo(() => {
    const list: { city: LocationCity; stateName: string }[] = []
    locations.forEach((s) => {
      s.cities.forEach((c) => {
        if (c.is_popular) {
          list.push({ city: c, stateName: s.name })
        }
      })
    })
    return list
  }, [locations])

  const handleCityClick = (cityName: string) => {
    navigate(`/buy?city=${encodeURIComponent(cityName)}`)
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FFF0E0] via-[#FFF8F2] to-[#FFFDFB] py-14 md:py-18 border-b border-[#EAEAEA]">
        <div className="container-custom text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/15 text-[#F47B20] mb-3">
            <Compass className="w-3.5 h-3.5" /> Pan-India Coverage
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] tracking-tight mb-4">
            Explore Properties by Location
          </h1>
          <p className="text-base text-[#727272] max-w-xl mx-auto leading-relaxed">
            Find residential plots, commercial land, and agricultural properties across 30+ states and 100+ cities in India.
          </p>

          {/* Location Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city (e.g. Noida, Pune, Lucknow) or State..."
              className="w-full bg-white border border-[#EAEAEA] rounded-2xl pl-12 pr-10 py-3.5 text-sm text-[#202124] placeholder-gray-400 shadow-md focus:outline-none focus:border-[#F47B20] focus:ring-4 focus:ring-orange-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container-custom py-10 md:py-14 space-y-12">
        {/* Popular Cities Grid */}
        {!searchQuery && selectedStateFilter === 'all' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#F47B20]" />
                  Popular Investment Hubs
                </h2>
                <p className="text-xs sm:text-sm text-[#727272] mt-0.5">
                  Top cities with highest buyer demand and high ROI land parcels
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {popularCities.slice(0, 12).map(({ city, stateName }) => (
                <button
                  key={city.id}
                  onClick={() => handleCityClick(city.name)}
                  className="card-hover bg-white border border-[#EAEAEA] rounded-2xl p-4 text-left flex flex-col justify-between group transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] text-[#F47B20] flex items-center justify-center mb-3 group-hover:bg-[#F47B20] group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#202124] group-hover:text-[#F47B20] transition-colors truncate">
                      {city.name}
                    </h3>
                    <p className="text-[11px] text-[#727272] truncate">{stateName}</p>
                    <span className="inline-block mt-2 text-[10px] font-medium text-[#F47B20] group-hover:underline">
                      Explore Plots &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* State Filter Pills */}
        <section>
          <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedStateFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStateFilter === 'all'
                  ? 'bg-[#F47B20] text-white shadow-sm'
                  : 'bg-white border border-[#EAEAEA] text-[#727272] hover:border-[#F47B20] hover:text-[#202124]'
              }`}
            >
              All States ({locations.length})
            </button>
            {locations.map((state) => (
              <button
                key={state.id}
                onClick={() => setSelectedStateFilter(state.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStateFilter === state.name
                    ? 'bg-[#F47B20] text-white shadow-sm'
                    : 'bg-white border border-[#EAEAEA] text-[#727272] hover:border-[#F47B20] hover:text-[#202124]'
                }`}
              >
                {state.name}
              </button>
            ))}
          </div>
        </section>

        {/* All Locations Grouped by State */}
        <section className="space-y-8">
          {filteredStates.length > 0 ? (
            filteredStates.map((state) => (
              <div
                key={state.id}
                className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#FFF8F2] text-[#F47B20] font-bold text-xs flex items-center justify-center">
                      {state.code}
                    </span>
                    <h2 className="font-bold text-lg text-[#202124]">{state.name}</h2>
                    <span className="text-xs text-[#727272]">
                      ({state.cities.length} {state.cities.length === 1 ? 'City' : 'Cities'})
                    </span>
                  </div>
                  <Link
                    to={`/buy?state_id=${state.id}`}
                    className="text-xs font-medium text-[#F47B20] hover:underline flex items-center gap-1"
                  >
                    View All in {state.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {state.cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityClick(city.name)}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#FCD2B2] hover:bg-[#FFF8F2] text-left transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#F47B20] shrink-0" />
                        <span className="text-xs font-medium text-[#202124] group-hover:text-[#F47B20] truncate">
                          {city.name}
                        </span>
                      </div>
                      {city.is_popular && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F47B20] shrink-0" title="Popular City" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#EAEAEA] p-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#202124]">
                No matching locations found
              </h3>
              <p className="text-xs text-[#727272] mt-1 mb-4">
                We couldn't find any state or city matching "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStateFilter('all')
                }}
                className="btn-primary btn-sm mx-auto"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>

        {/* Cannot find city banner */}
        <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 sm:p-8 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#202124]">
              Don't see your city or town listed?
            </h3>
            <p className="text-xs sm:text-sm text-[#727272] mt-0.5">
              We are constantly expanding our verified property network across rural and urban India.
            </p>
          </div>
          <Link to="/contact" className="btn-primary btn-sm whitespace-nowrap">
            Request a New Location
          </Link>
        </section>
      </div>
    </div>
  )
}

export default AllLocationsPage
