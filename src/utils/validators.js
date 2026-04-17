export const validators = {
  fullName: (value) => {
    if (!value) return "Full name is required";
    if (value.trim().split(" ").length < 2)
      return "Enter full name (first + last)";
    return null;
  },

  firstName: (value) => {
    if (!value) return "First name is required";
    if (value.includes(" ")) return "No spaces allowed";
    return null;
  },

  lastName: (value) => {
    if (!value) return "Last name is required";
    if (value.includes(" ")) return "No spaces allowed";
    return null;
  },

  email: (value) => {
    if (!value) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return "Invalid email address";
    return null;
  },

  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Minimum 6 characters required";
    return null;
  },
};
