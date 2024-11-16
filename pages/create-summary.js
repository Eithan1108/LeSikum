'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Folder, Plus, X, Tag, Upload, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Theme/Footer"
import Header from "@/components/Theme/Header"
import { addSummary, fetchUserById, fetchUserRepositories, fetchCommunityById } from '@/lib/db'
import { ToastProvider, useToast } from '@/components/ui/Toats'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Switch({ checked, onChange, id, label }) {
  return (
    <label 
      htmlFor={id} 
      className="flex items-center cursor-pointer"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors ${
            checked ? 'bg-orange-500' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        ></div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-orange-800">
          {label}
        </span>
      )}
    </label>
  )
}


async function getUserRepos(userId) {
  try {
      const response = await fetch(`/api/repositories/getUserRepositories?userId=${userId}`);
      if (!response.ok) {
          throw new Error("Failed to fetch user repositories");
      }
      const data = await response.json();
      return data.repositories;
  } catch (error) {
      console.error("Error fetching user repositories:", error);
      throw error;
  }
}

async function getCommunityById(communityId) {
  try {
      const response = await fetch(`/api/communities/getCommunityById?id=${communityId}`);
      if (!response.ok) {
          throw new Error("Failed to fetch community");
      }
      const data = await response.json();
      return data.community;
  } catch (error) {
      console.error("Error fetching community:", error);
      throw error;
  }
}


async function notifyFollowersOnNewSummary(userId, summary) {
  try {
    console.log(' ---- Notify followers on new summary ----', userId, summary);
      const response = await fetch("/api/notifications/notifyFollowersOnNewSummary/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              userId,
              summary,
          }),
      });

      const data = await response.json(); // Parse the JSON response
      if (data.success) {
          console.log("Notification sent successfully:", data.notification);
      } else {
          console.error("Failed to send notification:", data.message);
      }
  } catch (error) {
      console.error("Error notifying followers:", error);
  }
}




function CreateSummaryContent() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [user, setUser] = useState(null)
  const [userRepositories, setUserRepositories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToast()
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)
  const [visibilityWarning, setVisibilityWarning] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        if (userId) {
          fetch(`/api/users/findUser?id=${userId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json(); // Make sure to return the JSON
          })
          .then((user) => {
            console.log("Fetched user:", user); // This should now correctly log the user object
            setUser(user); // Assuming setUser is a function to update state
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
          });

          const repos = await getUserRepos(userId);
          setUserRepositories(repos); 

          // const fetchedUser = await fetchUserById(userId);
          // setUser(fetchedUser);
          // const repos = await fetchUserRepositories(userId);
          // setUserRepositories(repos);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Failed to load data. Please try again.', 'error');
      }
    };
    fetchData();
  }, [addToast]);

  useEffect(() => {
    const updateVisibilityWarning = async () => {
      if (location) {
        try {
          const warning = await getVisibilityWarning();
          setVisibilityWarning(warning);
        } catch (error) {
          console.error('Error getting visibility warning:', error);
          setVisibilityWarning("Unable to determine visibility. Please check your settings.");
        }
      } else {
        setVisibilityWarning("Please select a location to see visibility details.");
      }
    };
    updateVisibilityWarning();
  }, [location, isPrivate]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // if (!user) {
      //   throw new Error('User not found');
      // }
      const locationPath = location.split('/');
      const repoId = locationPath[0];
      const folderPath = locationPath.slice(1);
      const folderId = folderPath.length > 0 ? folderPath[folderPath.length - 1] : undefined;

      const newSummary = {
        title,
        description,
        content,
        author: user.name,
        owner: user.id,
        tags: selectedTags,
        isPrivate,
        neuronGraph: {},
        path: ["Root", ...folderPath],
        dateCreated:  new Date().toISOString().slice(0, 10),
        lastUpdated:  new Date().toISOString().slice(0, 10),
        id: Date.now().toString(),
        fileId: "",
      }
      console.log("Is private:", isPrivate)
      console.log(newSummary)

      let fileId = null;
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', user.id)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.message || 'File upload failed')
        }

        const uploadedFile = await uploadResponse.json()
        fileId = uploadedFile.fileId
      }

      if (fileId) {
        newSummary.fileId = fileId
      }

      console.log("______________Creating summary______________:", newSummary)

      const response = await fetch("/api/summaries/createSummary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: newSummary,
          repoId, // Pass repoId separately
          folderId, // Pass folderId if necessary
        }),
      });

      console.log("Summary created successfully!", newSummary)

      // console.log(' ---- Notify followers on new summary ----', user.id, newSummary);
      // const response1 = await fetch("/api/notifications/notifyFollowersOnNewSummary", {
      //     method: "POST",
      //     headers: {
      //         "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //         userId: user.id,
      //         summary: newSummary,
      //     }),
      // });

      // const data = await response1.json(); // Parse the JSON response
      // if (data.success) {
      //     console.log("Notification sent successfully:", data.notification);
      // } else {
      //     console.error("Failed to send notification:", data.message);
      // }

      if(!newSummary.isPrivate) {
        console.log(' ---- Notify followers on new summary ----', user.id, newSummary);
        const response1 = await fetch("/api/notifications/notifyFollowersOnNewSummary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            summary: newSummary,
          }),
        });
        
        if (!response1.ok) {
          const errorData = await response1.json();
          throw new Error(errorData.message || 'Failed to notify followers.');
        }
        const data = await response1.json();
        console.log("Notification sent:", data);
      }
      

    


      // const addedSummary = await addSummary(newSummary, repoId, folderId)
      addToast('Summary created successfully!', 'success');
      router.push(`/dashboard?userId=${user.id}`)
    } catch (error) {
      console.error('Error creating summary:', error)
      addToast(error.message || 'Failed to create summary. Please try again.', 'error');
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setNewTag('')
      setTagSearch('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const getVisibilityWarning = async () => {
    if (!location) return "Please select a location to see visibility details."

    const [repoId] = location.split('/');
    const selectedRepo = userRepositories.find(repo => repo.id === repoId);

    if (!selectedRepo) return "Please select a valid repository to see visibility details."

    let communityType = "No"
    if (selectedRepo.communityId) {
      try {
        const community = await getCommunityById(selectedRepo.communityId)
        if (community) {
          communityType = community.joinPolicy === "open" ? "Public" : "Private"
        }
      } catch (error) {
        console.error('Error fetching community:', error)
        // If we can't fetch the community, we'll assume it's not associated with one
      }
    }

    const repoType = selectedRepo.isPrivate ? "Private" : "Public"
    const summaryType = isPrivate ? "Private" : "Public"

    const scenarios = {
      "Public Community + Public Repository + Public Summary": "This summary will be fully visible to all users.",
      "Public Community + Public Repository + Private Summary": "This summary will only be visible to its owner and collaborators.",
      "Public Community + Private Repository + Public Summary": "This summary will only be visible to community members and repository collaborators.",
      "Public Community + Private Repository + Private Summary": "This summary will only be visible to its owner and collaborators.",
      "Private Community + Public Repository + Public Summary": "This summary will only be visible to community members.",
      "Private Community + Public Repository + Private Summary": "This summary will only be visible to its owner and collaborators.",
      "Private Community + Private Repository + Public Summary": "This summary will only be visible to community members and repository collaborators.",
      "Private Community + Private Repository + Private Summary": "This summary will only be visible to its owner and collaborators.",
      "No Community + Public Repository + Public Summary": "This summary will be visible and discoverable by anyone.",
      "No Community + Public Repository + Private Summary": "This summary will only be visible to its owner and collaborators.",
      "No Community + Private Repository + Public Summary": "This summary will only be visible to repository collaborators.",
      "No Community + Private Repository + Private Summary": "This summary will only be visible to its owner and collaborators."
    }

    const key = `${communityType} Community + ${repoType} Repository + ${summaryType} Summary`;
    return scenarios[key] || "Visibility cannot be determined. Please check your settings."
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const renderFolders = (items, parentId, level = 0) => {
    return items
      .filter(item => item.type === 'folder' || item.items)
      .map((folder) => {
        const currentPath = `${parentId}/${folder.id}`
        const isExpanded = expandedFolders[folder.id]
        const hasSubfolders = folder.items && folder.items.some(item => item.type === 'folder' || item.items)

        return (
          <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
            <button
              type="button"
              className={`w-full text-left px-2 py-1 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                location === currentPath ? 'bg-orange-200' : ''
              }`}
              onClick={() => {
                setLocation(currentPath)
                if (hasSubfolders) {
                  toggleFolder(folder.id)
                }
              }}
            >
              {hasSubfolders && (
                isExpanded ? (
                  <ChevronDown className="inline-block mr-1 h-4 w-4 text-orange-600" />
                ) : (
                  <ChevronRight className="inline-block mr-1 h-4 w-4 text-orange-600" />
                )
              )}
              <Folder className="inline-block mr-2 h-4 w-4 text-orange-600" />
              {folder.name}
            </button>
            {isExpanded && folder.items && folder.items.length > 0 && renderFolders(folder.items, currentPath, level + 1)}
          </div>
        )
      })
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={() => {}} userId={user?.id} />

      <main className="container mx-auto p-4 max-w-3xl">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-orange-200">
            <CardTitle className="text-2xl font-bold text-orange-800">Create New Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-orange-800">Summary Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Enter summary title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-orange-800">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Describe your summary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-orange-800">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Enter summary content"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium text-orange-800">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-orange-600 hover:text-orange-800">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative mt-2">
                  <div className="flex">
                    <Input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value)
                        setIsTagDropdownOpen(true)
                      }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                      placeholder="Search or add new tag"
                      className="w-full  px-3 py-2 bg-orange-50 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddTag(tagSearch)}
                      className="ml-2 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Tag className="h-5 w-5" />
                    </Button>
                  </div>
                  {isTagDropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-orange-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {selectedTags.map((tag, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
                          onClick={() => {
                            handleAddTag(tag)
                            setIsTagDropdownOpen(false)
                          }}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-orange-800">Location</Label>
                <Card className="bg-white shadow-md">
                  <CardHeader className="py-3 px-4 bg-orange-100 border-b border-orange-200">
                    <CardTitle className="text-sm font-semibold text-orange-800">Select a location for your summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-60 overflow-y-auto">
                      {userRepositories.map((repo) => (
                        <div key={repo.id} className="border-b border-orange-100 last:border-b-0">
                          <button
                            type="button"
                            className={`w-full text-left px-4 py-2 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 ${
                              location === repo.id ? 'bg-orange-100' : ''
                            }`}
                            onClick={() => {
                              setLocation(repo.id)
                              toggleFolder(repo.id)
                            }}
                          >
                            {expandedFolders[repo.id] ? (
                              <ChevronDown className="inline-block mr-2 h-4 w-4 text-orange-600" />
                            ) : (
                              <ChevronRight className="inline-block mr-2 h-4 w-4 text-orange-600" />
                            )}
                            <Folder className="inline-block mr-2 h-4 w-4 text-orange-600" />
                            {repo.name}
                          </button>
                          {expandedFolders[repo.id] && renderFolders(repo.rootFolder.items, repo.id, 1)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-medium text-orange-800">Upload File (Optional)</Label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    isDragging ? 'border-orange-500 bg-orange-50' : 'border-orange-300'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-orange-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-orange-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-orange-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-orange-500">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between space-x-2 bg-orange-100 p-4 rounded-md">
                <span className="text-sm font-medium text-orange-800">Summary Privacy</span>
                <Switch
                  checked={isPrivate}
                  onChange={setIsPrivate}
                  id="privacy-toggle"
                  label={isPrivate ? 'Private' : 'Public'}
                />
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-orange-700">
                    {visibilityWarning}
                  </p>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 py-2 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Summary'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function CreateSummary() {
  return (
    <ToastProvider>
      <CreateSummaryContent />
    </ToastProvider>
  )
}