export const toSafeUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  roles: user.roles,
  userImageUrl: user.userImage?.url || null,
});
