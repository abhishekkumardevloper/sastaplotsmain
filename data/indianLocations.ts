// Indian States, Major Cities, and Sample Localities for Sasta Plots

export interface LocationCity {
  id: number
  name: string
  popularLocalities: string[]
}

export interface LocationState {
  id: number
  code: string
  name: string
  cities: LocationCity[]
}

export const INDIAN_STATES_DATA: LocationState[] = [
  {
    id: 1,
    code: 'KA',
    name: 'Karnataka',
    cities: [
      {
        id: 101,
        name: 'Bengaluru',
        popularLocalities: ['Devanahalli', 'Sarjapur Road', 'Whitefield', 'Electronic City', 'Kanapura Road', 'Yelahanka', 'Hoskote', 'Nelamangala', 'Bidadi', 'Doddaballapur'],
      },
      {
        id: 102,
        name: 'Mysuru',
        popularLocalities: ['Vijayanagar', 'Bogadi', 'Hunsur Road', 'Bannur Road', 'JP Nagar', 'KRS Road'],
      },
      {
        id: 103,
        name: 'Mangaluru',
        popularLocalities: ['Surathkal', 'Bejai', 'Kadri', 'Derlakatte', 'Mulki'],
      },
      {
        id: 104,
        name: 'Hubballi-Dharwad',
        popularLocalities: ['Gokul Road', 'Vidyanagar', 'Kusugal Road', 'Navanagar'],
      },
    ],
  },
  {
    id: 2,
    code: 'MH',
    name: 'Maharashtra',
    cities: [
      {
        id: 201,
        name: 'Pune',
        popularLocalities: ['Hinjawadi', 'Wagholi', 'Kharadi', 'Talegaon Dabhade', 'Chakan', 'Pirangut', 'Uruli Kanchan', 'Shirwal'],
      },
      {
        id: 202,
        name: 'Mumbai & Navi Mumbai',
        popularLocalities: ['Panvel', 'Uran', 'Dronagiri', 'Kalyan', 'Badlapur', 'Karjat', 'Shahapur'],
      },
      {
        id: 203,
        name: 'Nagpur',
        popularLocalities: ['Wardha Road', 'MIHAN', 'Besa', 'Manish Nagar', 'Umred Road'],
      },
      {
        id: 204,
        name: 'Nashik',
        popularLocalities: ['Gangapur Road', 'Indira Nagar', 'Pathardi Phata', 'Dindori Road'],
      },
    ],
  },
  {
    id: 3,
    code: 'TG',
    name: 'Telangana',
    cities: [
      {
        id: 301,
        name: 'Hyderabad',
        popularLocalities: ['Shadnagar', 'Mokila', 'Shamshabad', 'Patancheru', 'Kollur', 'Kothur', 'Maheshwaram', 'Adibatla', 'Ghatkesar', 'Sangareddy'],
      },
      {
        id: 302,
        name: 'Warangal',
        popularLocalities: ['Hanamkonda', 'Kazipet', 'Hunter Road', 'Enumamula'],
      },
    ],
  },
  {
    id: 4,
    code: 'TN',
    name: 'Tamil Nadu',
    cities: [
      {
        id: 401,
        name: 'Chennai',
        popularLocalities: ['OMR', 'GST Road', 'Guduvanchery', 'Avadi', 'Poonamallee', 'Kelambakkam', 'Thiruporur', 'Sriperumbudur'],
      },
      {
        id: 402,
        name: 'Coimbatore',
        popularLocalities: ['Avinashi Road', 'Saravanampatti', 'Kalapatti', 'Thudiyalur', 'Pollachi Road'],
      },
    ],
  },
  {
    id: 5,
    code: 'DL',
    name: 'Delhi NCR',
    cities: [
      {
        id: 501,
        name: 'Gurugram',
        popularLocalities: ['Sohna Road', 'Dwarka Expressway', 'Golf Course Ext Road', 'Pataudi Road', 'Manesar'],
      },
      {
        id: 502,
        name: 'Noida & Greater Noida',
        popularLocalities: ['Sector 150', 'Greater Noida West', 'Yamuna Expressway', 'Knowledge Park', 'Pari Chowk'],
      },
      {
        id: 503,
        name: 'Faridabad',
        popularLocalities: ['Neharpar / Greater Faridabad', 'Sector 82', 'Surajkund Road'],
      },
    ],
  },
  {
    id: 6,
    code: 'AP',
    name: 'Andhra Pradesh',
    cities: [
      {
        id: 601,
        name: 'Visakhapatnam',
        popularLocalities: ['Madhurawada', 'Bhogapuram', 'Pendurthi', 'Anandapuram'],
      },
      {
        id: 602,
        name: 'Vijayawada',
        popularLocalities: ['Gannavaram', 'Poranki', 'Mangalagiri', 'Kankipadu'],
      },
    ],
  },
  {
    id: 7,
    code: 'GJ',
    name: 'Gujarat',
    cities: [
      {
        id: 701,
        name: 'Ahmedabad',
        popularLocalities: ['Sanand', 'Bopal', 'SG Highway', 'Dholera SIR', 'Vaishno Devi Circle', 'Changodar'],
      },
      {
        id: 702,
        name: 'Surat',
        popularLocalities: ['Vesu', 'Pal', 'Dumas Road', 'Jahangirpura'],
      },
      {
        id: 703,
        name: 'Vadodara',
        popularLocalities: ['Gotri', 'Sevasi', 'Vasna Bhayli', 'Waghodia Road'],
      },
    ],
  },
  {
    id: 8,
    code: 'RJ',
    name: 'Rajasthan',
    cities: [
      {
        id: 801,
        name: 'Jaipur',
        popularLocalities: ['Ajmer Road', 'Tonk Road', 'Jagadpura', 'Sirsi Road', 'Kalwar Road', 'Mahapura'],
      },
      {
        id: 802,
        name: 'Udaipur',
        popularLocalities: ['Shobhagpura', 'Bedla', 'Sukher', 'Debari'],
      },
    ],
  },
  {
    id: 9,
    code: 'UP',
    name: 'Uttar Pradesh',
    cities: [
      {
        id: 901,
        name: 'Lucknow',
        popularLocalities: ['Shaheed Path', 'Sultanpur Road', 'Kisan Path', 'Faizabad Road', 'Amar Shaheed Path'],
      },
      {
        id: 902,
        name: 'Varanasi',
        popularLocalities: ['Shivpur', 'Sarnath', 'Pandeypur', 'Babatpur Road'],
      },
    ],
  },
  {
    id: 10,
    code: 'KL',
    name: 'Kerala',
    cities: [
      {
        id: 1001,
        name: 'Kochi',
        popularLocalities: ['Kakkanad', 'Aluva', 'Tripunithura', 'Edappally', 'Kaloor'],
      },
      {
        id: 1002,
        name: 'Thiruvananthapuram',
        popularLocalities: ['Kazhakoottam', 'Pattom', 'Kowdiar', 'Technopark Area'],
      },
    ],
  },
]
