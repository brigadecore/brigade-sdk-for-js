/**
 * A type whose values can be used to differentiate one type of Role from
 * another. This allows (for instance) system-level Roles to be differentiated
 * from project-level Roles.
 */
export class RoleType extends String {}

/**
 * A type whose values map to a well-defined Brigade Roles.
 */
export class RoleName extends String {}

// RoleScopeGlobal represents an unbounded scope.
export const RoleScopeGlobal = "*"

// Represents a set of permissions, with domain-specific meaning, held by a
// principal, such as a User or ServiceAccount.
export interface Role {
	/**
	 * Indicates the Role's type, for instance, system-level or project-level
	 */
	type: RoleType
	/**
	 * The name of a Role. Role names are well-defined and have domain-specific
	 * meaning.
	 */
	name: RoleName
	/**
	 * Qualifies the scope of the Role. The value is opaque and has meaning only
	 * in relation to a specific RoleName.
	 */
	scope?: string
}
