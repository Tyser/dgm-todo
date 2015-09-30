'use strict';

export default function mongooseRole(schema, options) {
  options = Object.assign({
    roles: [],
    accessLevels: {},
    rolePath: 'role',
    roleStaticPath: 'roles',
    accessLevelsStaticPath: 'accessLevels',
    hasAccessMethod: 'hasAccess',
    roleHasAccessMethod: 'roleHasAccess'
  });

  schema
    .path(options.rolePath, String)
    .path(options.rolePath)
      .enum({values: options.roles})
      .required(true);

  // Expose the roles
  schema.static(options.rolesStaticPath, options.roles);
  schema.static(options.accessLevelsStaticPath, options.accessLevels);

  // Set the hasAccess method
  schema.method(options.hasAccessMethod, function (accessLevel) {
    return roleHasAccess(this.get(options.rolePath), accessLevel);
  });

  // Set the roleHasAccess method
  schema.static(options.roleHasAccessMethod, roleHasAccess);

  function roleHasAccess(role, accessLevel) {
    if (typeof accessLevel === 'undefined') { return true; }
    let validRoles = options.accessLevels[accessLevel];
    // if there is nothing in the access levels for the given accessLevel, then
    // the return false.
    if (!validRoles) { return false; }
    return validRoles.indexOf(role) !== -1;
  }

}
