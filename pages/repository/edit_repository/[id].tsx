'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Input from "@/components/ui/SeconInput"
import { ArrowLeft, Save, Plus, Trash2, Folder, File, UserPlus } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "@/components/Theme/Footer"
import { fetchRepositoryById, updateRepository, inviteCollaborator, removeCollaborator, cancelCollaborationInvitation } from '@/lib/db'
import { Repository, RepositoryItem, RepositoryFolder, User } from '../../../lib/types'
import { CollaboratorInvitation } from '@/components/Collaborator/CollaboratorInvitation'
import { ToastProvider, useToast } from '@/components/ui/Toats'
import UnauthorizedAccess from '@/components/Theme/UnauthorizedAccess'


async function fetchRepositoryByIdNew(id: string) {
  try {
    const response = await fetch(`/api/repositories/getRepositoryById?id=${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch repository');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Repository not found');
    }

    return data.repository;
  } catch (error) {
    console.error('Error fetching repository:', error);
    throw error; // Re-throw error to be handled by the calling function
  }
};


function EditRepositoryPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<RepositoryItem | RepositoryFolder | null>(null)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [newFolderName, setNewFolderName] = useState<string>('')
  const [addingFolderTo, setAddingFolderTo] = useState<string | null>(null)
  const [collaboratorUsername, setCollaboratorUsername] = useState('')
  const [filteredUsernames, setFilteredUsernames] = useState<string[]>([])
  const { addToast } = useToast()
  const [user, setUser] = useState('')
  

  // Mock array of usernames (replace this with your actual data source)
  const allUsernames = ['user1', 'user2', 'user3', 'admin1', 'admin2', 'moderator']

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady) return;
      const { id, userId } = router.query;
      if (typeof id !== 'string' || typeof userId !== 'string') {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      if(!userId)
        setUser('0')
      else
        setUser(userId)
      if (!id || !userId) {
        setError('Invalid URL parameters')
        setLoading(false)
        return
      }

      try {
        const repoData = await fetchRepositoryByIdNew(id);
        if (!repoData) {
          throw new Error('Repository not found')
        }
        if (repoData.owner !== userId && !(repoData?.collaborators.includes(userId))) {
          throw new Error('Unauthorized to edit this repository')
        }
        setRepo(repoData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router.isReady, router.query, params, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRepo(prevRepo => prevRepo ? { ...prevRepo, [name]: value } : null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setRepo(prevRepo => prevRepo ? { ...prevRepo, tags } : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repo) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/repositories/updateRepo', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(repo),
    });
    
      addToast('Repository updated successfully', 'success');
    } catch (err) {
      console.error("Error updating repository:", err);
      addToast('Failed to update repository. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCollaboratorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollaboratorUsername(value);
    if (value.length > 0) {
      const filtered = allUsernames.filter(username => 
        username.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsernames(filtered);
    } else {
      setFilteredUsernames([]);
    }
  };

  const handleSelectCollaborator = (username: string) => {
    setCollaboratorUsername(username);
    setFilteredUsernames([]);
  };

  const inviteCollaboratorNew = async (
    repoId: string,
    username: string
  ): Promise<Repository> => {
    try {
      console.log(repoId, username)
      const response = await fetch('/api/repositories/inviteCollaborator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoId,
          username,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to invite collaborator');
      }
  
      const data = await response.json();
      return data.repository;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  };
  

  const handleInviteCollaborator = async () => {
    if (!repo || !collaboratorUsername) return;
    try {
      const updatedRepo = await inviteCollaboratorNew(repo.id, collaboratorUsername);
      setRepo(updatedRepo);
      setCollaboratorUsername('');
      addToast('Collaborator invited successfully', 'success');
    } catch (err) {
      console.error("Error inviting collaborator:", err);
      addToast('Failed to invite collaborator. Please try again.', 'error');
    }
  };

  const removeCollaboratorNew = async (repoId: string, userId: string) => {
    try {
      const response = await fetch("/api/repositories/removeCollaborator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoId, userId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }
  
      const data = await response.json();
      if (data.success) {
        return data.repository; // Return the updated repository if successful
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      throw error; // Propagate error
    }
  };
  
  

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!repo) return;
    try {
      const updatedRepo = await removeCollaboratorNew(repo.id, collaboratorId);
      setRepo(updatedRepo);
      addToast('Collaborator removed successfully', 'success');
    } catch (err) {
      console.error("Error removing collaborator:", err);
      addToast('Failed to remove collaborator. Please try again.', 'error');
    }
  };

  const cancelCollaborationInvitationAPI = async (repoId: string, userId: string) => {
    try {
      const response = await fetch('/api/repositories/cancelCollaborationInvitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoId: repoId,
          userId: userId,
        }),
      });
  
      // Check if the response is ok (status 2xx)
      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }
  
      // Return the response data, which should contain the updated repository
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error('Error in API call: ' + error.message);
    }
  };
  

  const handleCancelInvitation = async (userId: string) => {
    if (!repo) return;
  
    try {
      // Call the helper function to make the API request
      const data = await cancelCollaborationInvitationAPI(repo.id, userId);
  
      if (data.success) {
        setRepo(data.repository);  // Update the repo state with the updated repository
        addToast('Invitation cancelled successfully', 'success');  // Show success toast
      } else {
        addToast('Failed to cancel invitation. Please try again.', 'error');  // Show error toast
      }
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      addToast('Failed to cancel invitation. Please try again.', 'error');  // Show error toast
    }
  };
  

  const handleSearch = () => {
    // Implement search functionality if needed
  }

  const handleSelectItem = (item: RepositoryItem | RepositoryFolder) => {
    setSelectedItem(item);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!repo) return;
    const deleteItem = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] => {
      return items.filter(item => item.id !== itemId).map(item => {
        if ('items' in item) {
          return { ...item, items: deleteItem(item.items) };
        }
        return item;
      });
    };
    setRepo(prevRepo => {
      if (!prevRepo) return null;
      return {
        ...prevRepo,
        rootFolder: {
          ...prevRepo.rootFolder,
          items: deleteItem(prevRepo.rootFolder.items)
        }
      };
    });
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(null);
    }
  };

  const toggleFolder = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = new Set(prevOpenFolders);
      if (newOpenFolders.has(folderId)) {
        newOpenFolders.delete(folderId);
      } else {
        newOpenFolders.add(folderId);
      }
      return newOpenFolders;
    });
  }, []);

  const handleSelectFolder = useCallback((folder: RepositoryFolder) => {
    setSelectedItem(folder);
  }, []);

  const handleAddFolder = (folderId: string) => {
    setAddingFolderTo(folderId);
    setNewFolderName('');
  };

  const handleConfirmAddFolder = () => {
    if (!repo || !newFolderName.trim() || !addingFolderTo) return;

    const newFolder: RepositoryFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      items: [],
      path: []
    };

    setRepo(prevRepo => {
      if (!prevRepo) return null;
      const updateItems = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] => {
        return items.map(item => {
          if (item.id === addingFolderTo && 'items' in item) {
            return { ...item, items: [...item.items, newFolder] };
          } else if ('items' in item) {
            return { ...item, items: updateItems(item.items) };
          }
          return item;
        });
      };
      return {
        ...prevRepo,
        rootFolder: addingFolderTo === prevRepo.rootFolder.id
          ? { ...prevRepo.rootFolder, items: [...prevRepo.rootFolder.items, newFolder] }
          : { ...prevRepo.rootFolder, items: updateItems(prevRepo.rootFolder.items) }
      };
    });

    setOpenFolders(prev => new Set(prev).add(addingFolderTo));
    setAddingFolderTo(null);
    setNewFolderName('');
  };

  const handleCancelAddFolder = () => {
    setAddingFolderTo(null);
    setNewFolderName('');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    setRepo(prevRepo => {
      if (!prevRepo) return null;

      const newRepo = { ...prevRepo };
      let sourceItems: (RepositoryItem | RepositoryFolder)[];
      let destItems: (RepositoryItem | RepositoryFolder)[];

      const findItems = (folderId: string): (RepositoryItem | RepositoryFolder)[] | null => {
        if (folderId === 'root') return newRepo.rootFolder.items;
        const findInFolder = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] | null => {
          for (const item of items) {
            if ('items' in item) {
              if (item.id === folderId) return item.items;
              const found = findInFolder(item.items);
              if (found) return found;
            }
          }
          return null;
        };
        return findInFolder(newRepo.rootFolder.items);
      };

      sourceItems = findItems(source.droppableId) || [];
      destItems = findItems(destination.droppableId) || [];

      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      return newRepo;
    });
  };


  

  const renderFolderStructure = useCallback((folder: RepositoryFolder, level = 0) => {
    const isOpen = openFolders.has(folder.id);
    const isAddingToThisFolder = addingFolderTo === folder.id;

    return (
      <Droppable droppableId={folder.id} type="FOLDER_ITEM">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <div key={folder.id} style={{ marginLeft: `${level * 20}px` }}>
              <div className="flex items-center justify-between py-2">
                <button 
                  className="flex items-center text-left flex-grow"
                  onClick={(e) => {
                    toggleFolder(e, folder.id);
                    handleSelectFolder(folder);
                  }}
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <Folder className="w-4 h-4 mr-2 text-orange-500" />
                  ) : (
                    <Folder className="w-4 h-4 mr-2 text-orange-300" />
                  )}
                  <span className="font-medium text-orange-700">{folder.name}</span>
                </button>
                {!isAddingToThisFolder && (
                  <Button
                    onClick={() => handleAddFolder(folder.id)}
                    className="ml-2 p-1 bg-white hover:bg-orange-200 text-orange-500 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isAddingToThisFolder && (
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name"
                    className="flex-grow"
                  />
                  <Button onClick={handleConfirmAddFolder} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Add
                  </Button>
                  <Button onClick={handleCancelAddFolder} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
                    Cancel
                  </Button>
                </div>
              )}
              {isOpen && (
                <div>
                  {folder.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {'items' in item ? (
                            renderFolderStructure(item as RepositoryFolder, level + 1)
                          ) : (
                            <button 
                              className="flex items-center py-2 w-full text-left hover:bg-orange-100 transition-colors duration-200" 
                              style={{ marginLeft: `${(level + 1) * 20}px` }} 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                handleSelectItem(item as RepositoryItem);
                              }}
                            >
                              <File className="w-4 h-4 mr-2 text-orange-400" />
                              <span className="text-orange-600">{(item as RepositoryItem).title}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }, [openFolders, handleSelectFolder, handleSelectItem, toggleFolder, addingFolderTo, newFolderName, handleConfirmAddFolder, handleCancelAddFolder]);

  if (loading) {
    return <div className="container mx-auto p-4 bg-orange-50">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-orange-50">Error: {error}</div>
  }

  if (!repo) {
    return <div className="container mx-auto p-4 bg-orange-50">Repository not found</div>
  }

  if(user !== repo.owner && !repo.collaborators.includes(user)) { 
    return (
      <UnauthorizedAccess 
        redirectPath={`/dashboard?userId=${user}`}
      />
    )
  }


  

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={repo.owner} />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        <Link
          href={`/repository/${repo.id}?userId=${repo.owner}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Repository
        </Link>

        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-800">Edit Repository: {repo.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-orange-700">Repository Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={repo.name}
                  onChange={handleInputChange}
                  required
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-orange-700">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={repo.description}
                  onChange={handleInputChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="collaborator" className="text-orange-700">Invite Collaborator</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
                    <Input
                      id="collaborator"
                      value={collaboratorUsername}
                      onChange={handleCollaboratorInputChange}
                      placeholder="Enter username"
                      className="pl-10 border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    />
                    {filteredUsernames.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-orange-200 rounded-md mt-1 max-h-40 overflow-auto">
                        {filteredUsernames.map((username) => (
                          <li
                            key={username}
                            className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                            onClick={() => handleSelectCollaborator(username)}
                          >
                            {username}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button 
                    onClick={handleInviteCollaborator} 
                    type="button"
                    className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                  >
                    Invite
                  </Button>
                </div>
              </div>

              <CollaboratorInvitation
                userId={user}
                collaborators={repo.collaborators}
                pendingCollaborators={repo.pendingCollaborators}
                onRemoveCollaborator={handleRemoveCollaborator}
                onCancelInvitation={handleCancelInvitation}
              />

              <div>
                <Label htmlFor="tags" className="text-orange-700">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={repo.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <Label className="text-orange-700">Folder Structure</Label>
                <div className="border border-orange-200 rounded-md p-4 bg-white">
                  <DragDropContext onDragEnd={onDragEnd}>
                    {renderFolderStructure(repo.rootFolder)}
                  </DragDropContext>
                </div>
              </div>

              {selectedItem && (
                <div>
                  <Label className="text-orange-700">Selected Item</Label>
                  <div className="flex items-center justify-between p-2 bg-orange-100 rounded-md">
                    <span className="text-orange-800">{('title' in selectedItem ? selectedItem.title : selectedItem.name)}</span>
                    <Button
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 ease-in-out flex items-center px-4 py-2"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function EditRepositoryPage() {
  return (
    <ToastProvider>
      <EditRepositoryPageContent />
    </ToastProvider>
  )
}