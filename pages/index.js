'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Share2, Zap, Target, Users, Rocket } from "lucide-react"
import Link from 'next/link'
import Footer from "@/components/Theme/Footer"
import RandomLoadingComponent from "@/components/ui/Loading"

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <RandomLoadingComponent />
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-orange-700">LeSikum</span>
            </Link>
            <div className="space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth?mode=login">Log In</Link>
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/auth?mode=signup">Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold text-orange-700 mb-6">
            Revolutionize Your Knowledge Sharing
          </h1>
          <p className="text-xl md:text-2xl text-orange-600 mb-12 max-w-3xl mx-auto">
          LeSikum transforms how you create, discover, and share concise summaries on any topic. Unlock a world of knowledge at your fingertips.
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 px-8" asChild>
            <Link href="/auth?mode=signup">Start Your Learning Journey</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <BookOpen className="w-6 h-6 mr-2 text-orange-500" />
                Concise Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600">
                Create clear, concise summaries from complex topics in minutes. Say goodbye to information overload and hello to efficient learning.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Share2 className="w-6 h-6 mr-2 text-orange-500" />
                Collaborative Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600">
                Share your summaries and insights with a global community of learners and experts. Engage in discussions and broaden your understanding through diverse perspectives.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Zap className="w-6 h-6 mr-2 text-orange-500" />
                Continuous Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600">
                Experience personalized learning paths that evolve with your progress. Adapt your learning style and retain information more effectively.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold text-orange-700 mb-6">
            Revolutionize Your Learning Experience
          </h2>
          <p className="text-xl text-orange-600 mb-12 max-w-3xl mx-auto">
          LeSikum is not just another learning platform. It's a game-changer in the world of knowledge acquisition and sharing. Here's why you'll love it:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Target className="w-6 h-6 mr-2 text-orange-500" />
                  Precision Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  Our platform helps you identify and focus on the most crucial information, ensuring you grasp key concepts quickly and effectively.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Users className="w-6 h-6 mr-2 text-orange-500" />
                  Community-Driven Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  Benefit from the collective wisdom of our diverse user base. Gain unique perspectives and insights you won't find anywhere else.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Rocket className="w-6 h-6 mr-2 text-orange-500" />
                  Accelerated Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  With optimized learning paths, you'll achieve your learning goals faster than ever before. Watch your knowledge expand exponentially.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <BookOpen className="w-6 h-6 mr-2 text-orange-500" />
                  Diverse Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  From science and technology to arts and humanities, LeSikum covers a vast array of subjects. Your next discovery is just a click away.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-4xl font-bold text-orange-700 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <span className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-xl">1</span>
                  Sign Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  Create your account in seconds. We immediately start personalizing your experience based on your interests and goals.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <span className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-xl">2</span>
                  Explore or Create
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  Dive into our vast library of curated summaries or flex your knowledge by creating your own with our writing tools.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <span className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-xl">3</span>
                  Learn and Grow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  Engage with the community, challenge your understanding, and track your progress as you explore new exciting topics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold text-orange-700 mb-6">
            Ready to experience the future of learning?
          </h2>
          <p className="text-xl text-orange-600 mb-12 max-w-3xl mx-auto">
            Join LeSikum today and unlock the full potential of your learning journey. Supercharge your knowledge acquisition and sharing.
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 px-8" asChild>
            <Link href="/signup">Get Started Now - It's Free!</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-24">
          <h2 className="text-3xl font-bold text-orange-700 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Is LeSikum really free?</h3>
              <p className="text-orange-700">Yes! We offer a robust free tier that gives you access to most features. We also have premium plans for power users who want even more capabilities.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-600 mb-2">How accurate are the summaries?</h3>
              <p className="text-orange-700">Our summaries are created by users and reviewed by our community. However, we always encourage users to think critically and verify important information from primary sources.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Can I use LeSikum for academic purposes?</h3>
              <p className="text-orange-700">Many students and researchers use LeSikum to complement their studies. Just remember to cite appropriately if you're using summaries in your work.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-600 mb-2">How does LeSikum protect my privacy?</h3>
              <p className="text-orange-700">We take privacy seriously. Your personal information is encrypted, and we never share your data with third parties. You can learn more in our Privacy Policy.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}