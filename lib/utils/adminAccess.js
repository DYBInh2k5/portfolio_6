const parseAdminEmails = () => {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.FIREBASE_ADMIN_EMAILS ||
    "";
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const getAdminEmails = () => parseAdminEmails();

export const isAdminUser = (user) => {
  if (!user?.email) return false;
  const admins = parseAdminEmails();
  if (!admins.length) return false;
  return admins.includes(String(user.email).toLowerCase());
};
