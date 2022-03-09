import { PrincipalReference } from "./principals"
import { Role } from "./roles"

/**
 * Represents the assignment of a Role to a principal.
 */
export interface RoleAssignment {
  /**
   * Assigns a Role to the specified principal
   */
  role: Role
  /**
   * Specifies the principal to whom the Role is assigned
   */
  principal: PrincipalReference
  /**
   * Qualifies the scope of the Role. The value is opaque and has meaning only
   * in relation to a specific Role.
   */
  scope?: string
}
