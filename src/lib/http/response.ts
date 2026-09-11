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
   * @param dataResponse
   * @returns
   */
  private static baseResponse<TData>(
    dataResponse: DataResponseEntity<TData>
  ): DtoHttpResponse<TData> {
    const { message = 'data has been received', success = true, ...rest } = dataResponse

    return { success, message, ...rest } as DtoHttpResponse<TData>
  }

  /**
   * Response Get or Success
   * @param dataResponse
   * @returns
   */
  public static get<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been received'

    return this.baseResponse({ message, ...dataResponse } as DataResponseEntity<TData>)
  }

  /**
   * Response Created
   * @param dataResponse
   * @returns
   */
  public static created<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been created'

    return this.baseResponse({ message, ...dataResponse } as DataResponseEntity<TData>)
  }

  /**
   * Response Updated
   * @param dataResponse
   * @returns
   */
  public static updated<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been updated'

    return this.baseResponse({ message, ...dataResponse } as DataResponseEntity<TData>)
  }

  /**
   * Response Restored
   * @param dataResponse
   * @returns
   */
  public static restored<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been restored'

    return this.baseResponse({ message, ...dataResponse } as DataResponseEntity<TData>)
  }

  /**
   * Response Deleted
   * @param dataResponse
   * @returns
   */
  public static deleted<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been deleted'

    return this.baseResponse({ message, ...dataResponse } as DataResponseEntity<TData>)
  }

  /**
   * Response Paginated
   * @param paginated
   * @returns
   */
  public static paginated<TData>({ data, total, offset, limit }: Paginated<TData>) {
    return this.get({ data, metadata: { offset, limit, total } })
  }
}
