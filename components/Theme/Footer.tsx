import Link from 'next/link'
import { BookOpen, ClipboardList   } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-orange-200 mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <ClipboardList  className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold text-orange-700">LeSikum</span>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/about" className="text-orange-600 hover:text-orange-700">
              About
            </Link>
            <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
              Privacy
            </Link>
            <Link href="/terms" className="text-orange-600 hover:text-orange-700">
              Terms
            </Link>
            <Link href="/contact" className="text-orange-600 hover:text-orange-700">
              Contact
            </Link>
          </nav>
        </div>
        <div className="mt-4 text-center text-sm text-orange-600">
          © {new Date().getFullYear()} SummaryShare. All rights reserved.
        </div>
      </div>
    </footer>
  )
}