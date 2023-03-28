export interface IFormValues {
  login: string
  name: string
  position: string
  startDate: string
  endDate: string
  email: string
  phone: string
  avatar_url: string
}

export interface IResponseData {
  avatar_url: string | null
  name: string | null
  email: string | null
}
