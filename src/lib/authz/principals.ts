export class PrincipalType extends String {}

// A reference to any sort of security principal (human user, service account,
// etc.)
export interface PrincipalReference {
	/**
	 * Type qualifies what kind of principal is referenced by the ID field-- for
	 * instance, a User or a ServiceAccount
	 */
	type: PrincipalType
	/**
	 * ID references a principal. The Type qualifies what type of principal that
	 * is-- for instance, a User or a ServiceAccount.
	 */
	id: string
}
