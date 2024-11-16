import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface UnauthorizedAccessProps {
  redirectPath: string
}

export default function UnauthorizedAccess({ redirectPath }: UnauthorizedAccessProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-800 flex items-center">
            <AlertCircle className="mr-2 h-6 w-6 text-orange-600" />
            Whoops! Secret Orange Grove
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            Hey there, sneaky citrus seeker! 🍊 Looks like you've stumbled into our top-secret orange grove. 
            While we admire your zest for exploration, this juicy spot is off-limits!
          </p>
          <p className="text-orange-700 mb-4">
            Why not try peeling back the layers of other websites instead? This one's a bit too tangy for uninvited guests!
          </p>
          <p className="text-orange-700 mb-4 font-semibold">
            Remember: When life gives you oranges, make sure they're yours to squeeze! 🍋
          </p>
          <Button
            onClick={() => router.push(redirectPath)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to the Orchard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}