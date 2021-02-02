import * as meta from "../meta"

export type Method =
  | "get" | "GET"
  | "delete" | "DELETE"
  | "head" | "HEAD"
  | "options" | "OPTIONS"
  | "post" | "POST"
  | "put" | "PUT"
  | "patch" | "PATCH"
  | "purge" | "PURGE"
  | "link" | "LINK"
  | "unlink" | "UNLINK"

export class Request {
  method: Method
  path: string
  listOpts?: meta.ListOptions
  queryParams?: Map<string, string>
  includeTokenAuthHeader = true
  headers?: Map<string, string>
  bodyObjKind?: string
  bodyObj?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  successCode = 200

  constructor(method: Method, path: string) {
    this.method = method
    this.path = path
  }
}
