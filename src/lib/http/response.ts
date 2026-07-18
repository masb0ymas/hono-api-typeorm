import type z from 'zod'

type DataResponseEntity<TData> = {
  message?: string
  success?: boolean
} & TData

type DtoHttpResponse<TData> = {
  success: boolean
  message: string
} & Omit<DataResponseEntity<TData>, 'message' | 'success'>

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

    return { success, message, ...rest }
  }

  /**
   * Response Get or Success
   * @param dataResponse
   * @returns
   */
  public static get<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been received'

    return this.baseResponse({ message, ...dataResponse! })
  }

  /**
   * Response Created
   * @param dataResponse
   * @returns
   */
  public static created<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been created'

    return this.baseResponse({ success: 201, message, ...dataResponse! })
  }

  /**
   * Response Updated
   * @param dataResponse
   * @returns
   */
  public static updated<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been updated'

    return this.baseResponse({ message, ...dataResponse! })
  }

  /**
   * Response Restored
   * @param dataResponse
   * @returns
   */
  public static restored<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been restored'

    return this.baseResponse({ message, ...dataResponse! })
  }

  /**
   * Response Deleted
   * @param dataResponse
   * @returns
   */
  public static deleted<TData>(dataResponse?: DataResponseEntity<TData>): DtoHttpResponse<TData> {
    const message = 'data has been deleted'

    return this.baseResponse({ message, ...dataResponse! })
  }

  /**
   * Throw Get By ID
   * @param issues
   * @returns
   */
  public static throwGetByID(issues: z.core.$ZodIssue[]) {
    const message = 'ID must be a valid UUID'

    return this.baseResponse({ message, success: false, errors: issues })
  }

  /**
   * Throw Error
   * @param errorCode Error code
   * @param message Error message
   * @returns Error response
   */
  public static throwError(errorCode: string, message: string) {
    return this.baseResponse({
      message: `${errorCode}: ${message}`,
      success: false,
      error: errorCode,
    })
  }
}
