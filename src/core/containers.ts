/**
 * Represents a policy for whether container hosts already having a certain OCI
 * image should attempt to re-pull that image prior to launching a new container
 * based on that image.
 */
export enum ImagePullPolicy {
  /**
   * Represents a policy wherein container hosts
   * only attempt to pull an OCI image if that image does not already exist on
   * the host
   */
  IfNotPresent = "IfNotPresent",
  /**
   * Represents a policy wherein container hosts will always attempt to re-pull
   * an OCI image before launching a container based on that image
   */
  Always = "Always"
}

/**
 * Represents the technical details of an OCI container.
 */
export interface ContainerSpec {
  /**
   * Specifies the OCI image on which the container should be based
   */
  image: string
  /**
   * specifies whether a container host already having the specified OCI image
   * should attempt to re-pull that image prior to launching a new container
   */
  imagePullPolicy?: ImagePullPolicy
  /**
   * Specifies the command to be executed by the OCI container. This can be used
   * to optionally override the default command specified by the OCI image
   * itself.
   */
  command?: string[]
  /**
   * Specifies arguments to the command executed by the OCI container
   */
  arguments?: string[]
  /**
   * A map of key/value pairs that specify environment variables to be set
   * within the OCI container
   */
  environment?: { [key: string]: string }
}
