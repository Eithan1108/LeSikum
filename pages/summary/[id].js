'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Download, Eye, ArrowLeft, ThumbsUp, MessageSquare, Share2, Search, AlertCircle, Send, RefreshCw, Bookmark, User, Calendar, Sparkles, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "../../components/Theme/Header"
import Footer from "../../components/Theme/Footer"
import OwnerCard from '@/components/Cards/OwnerCard'
import { fetchSummaryById, fetchUserById, addCommentToSummary, likeSummary, saveSummary, viewSummary, fetchCommentsByIds } from "@/lib/db"
import UnauthorizedAccess from '@/components/Theme/UnauthorizedAccess'
import LoginSignupModal from '@/components/Auth/LoginSignupModal'



async function incrementSummaryViews(summaryId) {
  try {
    const response = await fetch(`/api/summaries/incViews?id=${summaryId}`, {
      method: "PUT",  // Use PUT for updating
    });

    if (!response.ok) {
      console.error("Failed to increment summary views");
    } else {
      console.log("Successfully incremented views for summary", summaryId);
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

async function incrementViews(id) {
  try {
    const incrementResponse = await fetch(`/api/users/incrementTotalViews?id=${id}`, {
      method: "PUT",  // Assuming PUT is the method for this API
    });

    if (!incrementResponse.ok) {
      console.error("Failed to increment views");
    } else {
      console.log("Successfully incremented views for user", id);
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

async function createComment(commentData) {
  try {
      const response = await fetch("/api/comments/createComment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentData),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      return result.comment;
  } catch (error) {
      console.error("Error creating comment:", error);
  }
}

async function fetchSummaryComments(summaryId) {
  try {
      const response = await fetch(`/api/summaries/getSummaryComments?summaryId=${summaryId}`);
      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      return result.comments;
  } catch (error) {
      console.error("Error fetching summary comments:", error);
      return [];
  }
}




export default function SummaryPage() {
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [owner, setOwner] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady) return;
  
      const { id, userId } = router.query;
      console.log("Route params:", { id, userId });
  
      if (id && (!userId || userId === '')) {
        console.log("No userId found. Opening login modal...");
        setIsLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (!id || !userId) {
        setError('Invalid URL parameters');
        setIsLoading(false);
        return;
      }
  
      try {
        setIsLoading(true);

        const response = await fetch(`/api/summaries/viewSummary?id=${id}&userId=${userId}`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          console.log("Failed to fetch summary");
          setError("Failed to fetch summary");
          return;
        }

        const data = await response.json();
        console.log("Summary data:", data);

        if (data.success) {
          const updatedSummary = data.summary;
          const updatedUser = data.user;
          const updatedOwner = data.owner;

          // Update states immediately
          setSummary(updatedSummary);
          setUser(updatedUser);
          setOwner(updatedOwner);

          const baseUrl = window.location.origin;
          const newShareUrl = `${baseUrl}/summary/${id}?userId=`; // Set userId to empty
          setShareUrl(newShareUrl);


          const comments = await fetchSummaryComments(data.summary.id);
          setComments(comments)

          const initialIsLiked = updatedUser.likedSummaries.includes(updatedSummary.id);
          console.log('Initial isLiked state:', initialIsLiked);
          setIsLiked(initialIsLiked);

          const initialIsSaved = updatedUser.savedSummaries.includes(updatedSummary.id);
          console.log('Initial isSaved state:', initialIsSaved);
          setIsSaved(initialIsSaved);

          // Increment views for user and summary
          await incrementViews(updatedOwner.id);
          await incrementSummaryViews(updatedSummary.id);

          // Optionally, update views in the state for immediate reflection
          setSummary((prevSummary) => ({
            ...prevSummary,
            views: prevSummary.views + 1,  // Update summary views immediately
          }));

          setOwner((prevOwner) => ({
            ...prevOwner,
            totalViews: prevOwner.totalViews + 1,  // Update owner total views immediately
          }));

          setUser((prevUser) => ({
            ...prevUser,
            totalViews: prevUser.totalViews + 1,  // Update user total views immediately
          }));
        }
  

  

        // // Fetch comments
        // const fetchedComments = await fetchCommentsByIds(updatedSummary.comments);
        // setComments(fetchedComments);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };


  
    fetchData();
  }, [router.isReady, router.query]);

  const handleLoginSuccess = (userId) => {
    setIsLoginModalOpen(false);
    router.push(`/summary/${router.query.id}?userId=${userId}`);
  };

  const handleDownload = async () => {
    if (summary && summary.fileId) {
      try {
        const response = await fetch(`/api/download/${summary.fileId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('File not found');
          }
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = summary.fileId; // Use the fileId as the download filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Failed to download the file. Please try again.');
      }
    } else {
      setError('No file available for download');
    }
  };

  const handleSearch = () => {
    if (summary) {
      const lowercaseTerm = searchTerm.toLowerCase()
      const result = summary.neuronGraph[lowercaseTerm]
      if (result) {
        setSearchResult(result)
        setNotFound(false)
      } else {
        setSearchResult(null)
        setNotFound(true)
      }
    }
  }

  // API functions (frontend)

// Like summary
async function likeSummary(summaryId, userId, ownerId) {
  const [summaryResponse, userResponse, ownerResponse] = await Promise.all([
      fetch(`/api/summaries/incrementLikes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaryId }),
      }).then((res) => res.json()),
      fetch(`/api/users/likeSummary`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaryId, userId }),
      }).then((res) => res.json()),
      fetch(`/api/users/incrementTotalLikes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerId }),
      }).then((res) => res.json()),
  ]);

  return {
      summary: summaryResponse.summary,
      user: userResponse.user,
      owner: ownerResponse.user,
  };
}

// Unlike summary
async function unlikeSummary(summaryId, userId, ownerId) {
  const [summaryResponse, userResponse, ownerResponse] = await Promise.all([
      fetch(`/api/summaries/decrementLikes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaryId }),
      }).then((res) => res.json()),
      fetch(`/api/users/unlikeSummary`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaryId, userId }),
      }).then((res) => res.json()),
      fetch(`/api/users/decrementTotalLikes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerId }),
      }).then((res) => res.json()),
  ]);

  return {
      summary: summaryResponse.summary,
      user: userResponse.user,
      owner: ownerResponse.user,
  };
}

async function saveSummary(summaryId, userId){
  const response = await fetch(`/api/users/saveSummary`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryId, userId }),
  });

  if (!response.ok) {
      throw new Error("Failed to save summary.");
  }

  const data = await response.json();
  return data.user;
};

async function unsaveSummary(summaryId, userId){
  const response = await fetch(`/api/users/unsaveSummary`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryId, userId }),
  });

  if (!response.ok) {
      throw new Error("Failed to unsave summary.");
  }

  const data = await response.json();
  return data.user;
};

// File: utils/notifications.ts

async function sendLikeNotification(userId, summaryId) {
  try {
    const response = await fetch('/api/notifications/sendLikeNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, summaryId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send like notification:', errorData.message);
      return {
        success: false,
        message: errorData.message,
      };
    }

    const result = await response.json();
    console.log('Like notification sent:', result.message);
    return {
      success: true,
      notification: result.notification,
    };
  } catch (error) {
    console.error('Error while sending like notification:', error);
    return {
      success: false,
      message: 'An error occurred while sending the like notification.',
    };
  }
}




  const handleLike = async () => {
    if (summary && user && owner) {
        try {
            if (!isLiked) {
                // Like operation
                const { summary: updatedSummary, user: updatedUser, owner: updatedOwner } = await likeSummary(
                    summary.id,
                    user.id,
                    owner.id
                );
                console.log("Like operation result:", { updatedSummary, updatedUser, updatedOwner });
                sendLikeNotification(user.id, summary.id);
                setSummary(updatedSummary);
                setUser(updatedUser);
                setOwner(updatedOwner);
                setIsLiked(true);
            } else {
                // Unlike operation
                const { summary: updatedSummary, user: updatedUser, owner: updatedOwner } = await unlikeSummary(
                    summary.id,
                    user.id,
                    owner.id
                );
                console.log("Unlike operation result:", { updatedSummary, updatedUser, updatedOwner });
                
                setSummary(updatedSummary);
                setUser(updatedUser);
                setOwner(updatedOwner);
                setIsLiked(false);
            }
        } catch (err) {
            console.error("Error toggling like status:", err);
            setError("Failed to update like status. Please try again.");
        }
    }
};


const handleSave = async () => {
  if (summary && user) {
      try {
          let updatedUser;
          if (isSaved) {
              updatedUser = await unsaveSummary(summary.id, user.id);
          } else {
              updatedUser = await saveSummary(summary.id, user.id);
          }
          setUser(updatedUser);
          setIsSaved(!isSaved);
      } catch (err) {
          console.error("Error toggling save status:", err);
          setError("Failed to update save status. Please try again.");
      }
  }
};

// File: utils/notifications.ts

async function sendCommentNotification(summaryId, newComment) {
  try {
    const response = await fetch('/api/notifications/sendCommentNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summaryId, newComment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send comment notification:', errorData.message);
      return {
        success: false,
        message: errorData.message,
      };
    }

    const result = await response.json();
    console.log('Comment notification sent:', result.message);
    return {
      success: true,
      notification: result.notification,
    };
  } catch (error) {
    console.error('Error while sending comment notification:', error);
    return {
      success: false,
      message: 'An error occurred while sending the comment notification.',
    };
  }
}


const handleAddComment = async () => {
  if (newComment.trim() && summary && user) {
      const newCommentObj = {
          author: user.name,
          content: newComment.trim(),
          timestamp: new Date().toISOString(),
      };

      try {
          // Step 1: Create the new comment and get its ID
          const createdComment = await createComment(newCommentObj);
          if (!createdComment) throw new Error("Failed to create comment.");

          // Step 2: Add the comment ID to the summary's comments array
          const response = await fetch("/api/summaries/addComment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ summaryId: summary.id, commentId: createdComment.id }),
          });

          const result = await response.json();
          if (!result.success) throw new Error(result.message);

          const comments = await fetchSummaryComments(summary.id);
          setComments(comments)
          sendCommentNotification(summary.id, newCommentObj);
          setNewComment("");
          setIsCommentDialogOpen(false);
          

          
      } catch (err) {
          console.error("Error adding comment:", err);
          setError("Failed to add comment. Please try again.");
      }
  }
};



const handleShare = () => {
  const url = new URL(window.location.href);
  const urlWithoutUserId = url.origin + url.pathname + '?userId='; // Keep the base URL and path, but set userId to empty
  navigator.clipboard.writeText(urlWithoutUserId);  // Copy the modified URL to clipboard
  console.log('Sharing summary:', summary?.title);
  setIsShareDialogOpen(false);
};


const handleDeleteSummary = async (summaryId) => {
  try {
    const response = await fetch('/api/summaries/deleteSummary', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Summary deleted successfully:", data);
      // Update the UI or state accordingly
    } else {
      console.error("Failed to delete summary:", data.message);
      alert(data.message || "An error occurred while deleting the summary.");
    }
  } catch (error) {
    console.error("Error deleting summary:", error);
    alert("An unexpected error occurred.");
  }
};






  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.reload()} className="bg-orange-500 hover:bg-orange-600 text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  if (isLoginModalOpen) {
    return (
      <LoginSignupModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    )
  }

  if (!summary || !user || !owner) {
    return <div className="flex justify-center items-center h-screen">Summary, user, or owner not found</div>
  }

  if(!summary || (summary.isPrivate && user.id !== summary.owner)) {
    return (
<UnauthorizedAccess 
        redirectPath={`/dashboard?userId=${user?.id}`}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={user.id}/>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${user.id}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl relative">
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {/* {user && summary && user.id === summary.owner && (
              <Button
                onClick={handleDeleteSummary}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Summary
              </Button>
            )} */}
            <Button onClick={handleDownload} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
              <Download className="mr-2 h-4 w-4" /> Download Summary
            </Button>
          </div>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-orange-800 pr-32">{summary?.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <span>By {summary?.author}</span>
              <span>•</span>
              <span>Created: {summary?.dateCreated}</span>
              <span>•</span>
              <span>Last Updated: {summary?.lastUpdated}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {summary?.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-orange-200 text-orange-800">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="flex items-center text-orange-700"><Eye className="mr-1 h-4 w-4" /> {summary?.views}</span>
              <span className="flex items-center text-orange-700"><ThumbsUp className="mr-1 h-4 w-4" /> {summary?.likes}</span>
              <span className="flex items-center text-orange-700"><MessageSquare className="mr-1 h-4 w-4" /> {summary?.comments.length}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={handleLike} variant={isLiked ? "secondary" : "outline"} className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <ThumbsUp className="mr-2 h-4 w-4" /> {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button onClick={handleSave} variant={isSaved ? "secondary" : "outline"} className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <Bookmark className="mr-2 h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={() => setIsCommentDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <MessageSquare className="mr-2 h-4 w-4" /> Comment
              </Button>
              <Button onClick={() => setIsShareDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
            <div className="h-48 overflow-y-auto rounded-md border border-orange-200 p-4 mb-4 bg-white">
              <p className="text-orange-800">{summary?.description}</p>
            </div>
            <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border-2 border-orange-300">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-200">
                <CardTitle className="text-2xl font-bold text-orange-800 flex items-center">
                  <Sparkles className="mr-2 h-6 w-6 text-orange-600" />
                  AI Features Coming Soon!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-orange-700 mb-4">
                  We're excited to announce that cutting-edge AI features are on their way to enhance your summary experience!
                </p>
                <ul className="list-disc list-inside space-y-2 text-orange-600">
                  <li>AI-powered summary generation</li>
                  <li>Intelligent keyword extraction</li>
                  <li>Automated tagging suggestions</li>
                  <li>Smart content recommendations</li>
                </ul>
              </CardContent>
            </Card>
            {searchResult && (
              <div className="mb-4 border border-orange-200 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">{searchResult.term}</h3>
                <p className="text-orange-700 mb-2">{searchResult.definition}</p>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Related Terms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.relatedTerms.map(term => (
                      <Button
                        key={term}
                        variant="outline"
                        className="border border-orange-300 text-orange-600 px-2 py-1 rounded-full text-sm hover:bg-orange-100 transition-colors duration-200"
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch();
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {notFound && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <AlertCircle  className="h-4 w-4 inline mr-2" />
                <span className="block sm:inline">Term not found. Please try a different search term.</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-orange-800">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <OwnerCard owner={owner} viewingUserId={user.id} />
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-800">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border border-orange-200 rounded-lg p-4 bg-white">
                <p className="text-orange-700 mb-2">{comment.content}</p>
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.author}`} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{comment.author}</span>
                  </div>
                  <span>{new Date(comment.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {isCommentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-orange-800">Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full h-32 border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsCommentDialogOpen(false)} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                  Cancel
                </Button>
                <Button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                  <Send className="mr-2 h-4 w-4" /> Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isShareDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Card className="w-full max-w-md bg-white">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Share this Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={shareUrl.split('=')[0]} // Remove the userId parameter
                      readOnly
                      className="w-full border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => setIsShareDialogOpen(false)} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                        Cancel
                      </Button>
                      <Button onClick={handleShare} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                        <Share2 className="mr-2 h-4 w-4" /> Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

      <Footer />
    </div>
  )
}