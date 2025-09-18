import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve} from "node:path"

export default defineConfig({
  plugins: [tailwindcss()],
  server: { open: true },
  build: {
    rollupOptions: {
      input: {
        index:        resolve(__dirname, "index.html"),
        listing:      resolve(__dirname, "listing.html"),
        login:        resolve(__dirname, "login.html"),
        register:     resolve(__dirname, "register.html"),
        profile:      resolve(__dirname, "profile.html"),
        seller:       resolve(__dirname, "seller.html"),
        createListing:resolve(__dirname, "create-listing.html"),
        editListing:  resolve(__dirname, "edit-listing.html"),
        editProfile:  resolve(__dirname, "edit-profile.html"),
      },
    },
  },
});