
export interface ApiResponse {
  success: boolean;
  message?: string
  data?: Station[]
}

export interface Station {
  station_brand: string
  station_address: string
  station_id: number
  fuels: Fuel[]
}

export interface Fuel {
  id: number
  fuelType: "Regular" | "Midgrade" | "Premium" | "Diesel"
  prices: PumpPrice[]
}

export interface PumpPrice {
  isCash: boolean
  price: number
  reportedBy?: string
  postedTime?: Date
}

declare global{
  namespace Express {
    interface Response{
      data: Station[]
    }
  }
}
export {}