type DataResponseEntity<TData> = {
  message?: string
  success?: boolean
} & TData

type DtoHttpResponse<TData> = {
  success: boolean
  message: string
} & Omit<DataResponseEntity<TData>, 'message' | 'success'>

type Paginated<TData> = {
  data: TData[]
  total: number
  offset: number
  limit: number
}

export default class HttpResponse {
  /**
   * Base Response
   */
  private static baseResponse<TData>(
    dataResponse: DataResponseEntity<TData>
  ): DtoHttpResponse<TData> {
    const { message = 'data has been received', success = true, ...rest } = dataResponse

    return { success, message, ...rest } as DtoHttpResponse<TData>
  }

  public static get<TData>(dataResponse?: DataResponseEntity<TData>) {
    return this.baseResponse({ message: 'data has been received', ...dataResponse })
  }

  public static created<TData>(dataResponse?: DataResponseEntity<TData>) {
    return this.baseResponse({ message: 'data has been created', ...dataResponse })
  }

  public static updated<TData>(dataResponse?: DataResponseEntity<TData>) {
    return this.baseResponse({ message: 'data has been updated', ...dataResponse })
  }

  public static restored<TData>(dataResponse?: DataResponseEntity<TData>) {
    return this.baseResponse({ message: 'data has been restored', ...dataResponse })
  }

  public static deleted<TData>(dataResponse?: DataResponseEntity<TData>) {
    return this.baseResponse({ message: 'data has been deleted', ...dataResponse })
  }

  /**
   * Response Paginated
   */
  public static paginated<TData>({ data, total, offset, limit }: Paginated<TData>) {
    return this.get({ data, metadata: { offset, limit, total } })
  }
}
