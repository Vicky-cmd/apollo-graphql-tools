import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const instance = axios.create({
   baseURL: '',
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
   console.debug('Executing Request interceptor')

   config.headers['Content-Type'] = 'application/json'

   console.log(axios.getUri(config))

   return config
})

instance.interceptors.response.use((response: AxiosResponse) => {
   console.debug('Executing Response interceptor')
   if (
      response.status &&
      (response.status.toString().startsWith('4') ||
         response.status.toString().startsWith('5'))
   ) {
      console.error('Error with response: ', response.data)
   }

   return response
})

export default instance
