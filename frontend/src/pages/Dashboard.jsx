import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Manage products and orders from the admin.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/products"
          className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-primary-300 hover:shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            View, create, edit and delete products.
          </p>
          <Button variant="primary" size="sm" className="mt-4 w-fit">
            Go to Products
          </Button>
        </Link>
        <Link
          to="/orders"
          className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-primary-300 hover:shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage orders.
          </p>
          <Button variant="primary" size="sm" className="mt-4 w-fit">
            Go to Orders
          </Button>
        </Link>
      </div>
    </div>
  )
}
