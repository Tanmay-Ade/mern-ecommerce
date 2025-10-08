import { Outlet } from "react-router-dom"
import Header from "./Header"


const ShoppingLayout = () => {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
        <Header />
        <main className="flex flex-col w-full">
            <Outlet />
        </main>
    </div>
  )
}

export default ShoppingLayout
// This is client/src/components/shopping-view/Layout.jsx