export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

// Google OAuth Configuration
export const authConfig = {
  googleAuthUrl: `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`,
  googleCallbackUrl: `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/callback`,
  loginRedirect: "/auth/login",
  adminDashboard: "/admin/dashboard",
  userDashboard: "/shop/home",
};

export const addProductFormControls = [
  {
    name: "productName",
    label: "Product Name",
    placeholder: "Enter the product name",
    componentType: "input",
    type: "text",
  },
  {
    name: "productDescription",
    label: "Product Description",
    placeholder: "Enter the product description",
    componentType: "textarea",
  },
  {
    name: "recipient",
    label: "Recipient",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
    ],
  },
  {
    name: "category",
    label: "Category",
    componentType: "select",
    options: [
      { id: "silver", label: "Silver" },
      { id: "gold", label: "Gold" },
      { id: "diamond", label: "Diamond" },
    ],
  },
  {
    name: "jewellery",
    label: "Jewellery",
    componentType: "select",
    options: [
      { id: "select-a-category", label: "---Select-a-Category---" },
      { id: "all", label: "All" },
      { id: "rings", label: "Rings" },
      { id: "necklaces", label: "Necklaces" },
      { id: "pendants", label: "Pendants" },
      { id: "bracelets", label: "Bracelets" },
      { id: "earrings", label: "Earrings" },
      { id: "anklets", label: "Anklets" },
    ],
  },
  {
    name: "price",
    label: "Price",
    placeholder: "Enter the price",
    componentType: "input",
    type: "number",
  },
  {
    name: "salePrice",
    label: "Sale Price",
    placeholder: "Enter the sale price (if applicable)",
    componentType: "input",
    type: "number",
  },
  {
    name: "stock",
    label: "Stock Quantity",
    placeholder: "Enter the stock quantity",
    componentType: "input",
    type: "number",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "all",
    label: "All Products",
    path: "/shop/listing",
  },
  {
    id: "rings",
    label: "Rings",
    path: "/shop/listing",
  },
  {
    id: "necklaces",
    label: "Necklaces",
    path: "/shop/listing",
  },
  {
    id: "pendants",
    label: "Pendants",
    path: "/shop/listing",
  },
  {
    id: "bracelets",
    label: "Bracelets",
    path: "/shop/listing",
  },
  {
    id: "earrings",
    label: "Earrings",
    path: "/shop/listing",
  },
  {
    id: "anklets",
    label: "Anklets",
    path: "/shop/listing",
  },
];

export const recipientOptionMap = {
  men: "Men",
  women: "Women",
};

export const categoryOptionMap = {
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
};

export const jewelleryOptionMap = {
  rings: "Rings",
  necklaces: "Necklaces",
  pendants: "Pendants",
  bracelets: "Bracelets",
  earrings: "Earrings",
  anklets: "Anklets",
};

export const filterOptions = {
  recipient: [
    {
      id: "men",
      label: "Men",
    },
    {
      id: "women",
      label: "Women",
    },
  ],
  category: [
    {
      id: "silver",
      label: "Silver",
    },
    {
      id: "gold",
      label: "Gold",
    },
    {
      id: "diamond",
      label: "Diamond",
    },
  ],
  jewellery: [
    {
      id: "rings",
      label: "Rings",
    },
    {
      id: "necklaces",
      label: "Necklaces",
    },
    {
      id: "pendants",
      label: "Pendants",
    },
    {
      id: "bracelets",
      label: "Bracelets",
    },
    {
      id: "earrings",
      label: "Earrings",
    },
    {
      id: "anklets",
      label: "Anklets",
    },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter additional notes (optional)",
  },
];

// This is client/src/config/index.js
