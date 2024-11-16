// This file contains all database-related operations
import { Upload } from 'lucide-react';
import { NotificationStore, User, Community, Summary, Repository, Notification, Comment, NeuronGraph, RepositoryItem, RepositoryFolder } from './types'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import mongoose from "mongoose"

  
  const mockApiUrl = 'http://localhost:5000/users';
  
  export async function fetchUsers(): Promise<User[]> {
    const response = await fetch(mockApiUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    const userData = await response.json()
    return Array.isArray(userData) ? userData : Object.values(userData)
  }
  
  export async function createUser(newUser: Omit<User, 'id'>): Promise<User> {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newUser.password, salt)
  
    const userToCreate = {
      ...newUser,
      password: hashedPassword,
      id: Date.now().toString(),
    }
  
    const response = await fetch(mockApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userToCreate),
    })
    if (!response.ok) {
      throw new Error('Failed to create new user')
    }
    return await response.json()
  }
  
  export async function findUserByUsername(username: string): Promise<User | undefined> {
    const users = await fetchUsers()
    return users.find((user) => user.username === username)
  }
  
  export async function isUsernameTaken(username: string): Promise<boolean> {
    const user = await findUserByUsername(username)
    return !!user
  }
  
  export async function verifyUser(username: string, password: string): Promise<User | null> {
    const user = await findUserByUsername(username)
    if (!user) return null
  
    const isMatch = await bcrypt.compare(password, user.password)
    return isMatch ? user : null
  }
  
  export async function fetchUserById(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${mockApiUrl}/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    }
  }

  export async function fetchSummaries(): Promise<Summary[]> {
    const response = await fetch('http://localhost:5000/summeries');
    if (!response.ok) {
      throw new Error('Failed to fetch summaries');
    }
    return await response.json();
  }

  export async function fetchLikedSummaries(userId: string): Promise<Summary[]> {
    const response = await fetch(`http://localhost:5000/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData: User = await response.json();
    const summariesResponse = await fetch('http://localhost:5000/summeries');
    if (!summariesResponse.ok) {
      throw new Error('Failed to fetch summaries');
    }
    const allSummaries: Summary[] = await summariesResponse.json();
    return allSummaries.filter(summary => userData.likedSummaries.includes(summary.id));
  }
  
  export async function fetchSavedSummaries(userId: string): Promise<Summary[]> {
    const response = await fetch(`http://localhost:5000/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData: User = await response.json();
    const summariesResponse = await fetch('http://localhost:5000/summeries');
    if (!summariesResponse.ok) {
      throw new Error('Failed to fetch summaries');
    }
    const allSummaries: Summary[] = await summariesResponse.json();
    return allSummaries.filter(summary => userData.savedSummaries.includes(summary.id));
  }

  export async function fetchLikedRepositories(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData: User = await response.json();
      const reposResponse = await fetch('http://localhost:5000/repositories');
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await reposResponse.json();
      return allRepositories.filter(repo => userData.likedRepositories.includes(repo.id));
    } catch (error) {
      console.error('Error fetching liked repositories:', error);
      throw error;
    }
  }
  
  export async function fetchSavedRepositories(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData: User = await response.json();
      const reposResponse = await fetch('http://localhost:5000/repositories');
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await reposResponse.json();
      return allRepositories.filter(repo => userData.savedRepositories.includes(repo.id));
    } catch (error) {
      console.error('Error fetching saved repositories:', error);
      throw error;
    }
  }

  export async function fetchRepositories(userId?: string): Promise<Repository[]> {
    try {
      const response = await fetch('http://localhost:5000/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const repositories: Repository[] = await response.json();
      
      // Filter out private repositories if userId is not provided
      return userId 
        ? repositories 
        : repositories.filter(repo => !repo.isPrivate);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }
  
  export async function fetchRepositoryById(id: string): Promise<Repository | null> {
    try {
      const response = await fetch(`http://localhost:5000/repositories/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch repository');
      }
      const repository: Repository = await response.json();
      return repository;
    } catch (error) {
      console.error(`Error fetching repository with id ${id}:`, error);
      throw error;
    }
  }
  
  function findItemInFolder(folder: RepositoryFolder, itemId: string): RepositoryItem | null {
    for (const item of folder.items) {
      if ('title' in item && item.id === itemId) {
        return item as RepositoryItem;
      } else if ('items' in item) {
        const foundItem = findItemInFolder(item as RepositoryFolder, itemId);
        if (foundItem) return foundItem;
      }
    }
    return null;
  }
  
  export async function fetchRepositoryItem(repoId: string, itemId: string): Promise<RepositoryItem | null> {
    try {
      const repository = await fetchRepositoryById(repoId);
      if (!repository) return null;
  
      return findItemInFolder(repository.rootFolder, itemId);
    } catch (error) {
      console.error(`Error fetching item ${itemId} from repository ${repoId}:`, error);
      throw error;
    }
  }

  export async function fetchSummariesByOwnerId(userId: string): Promise<Summary[]> {
    try {
      const response = await fetch('http://localhost:5000/summeries');
      if (!response.ok) {
        throw new Error('Failed to fetch summaries');
      }
      const allSummaries: Summary[] = await response.json();
      return allSummaries.filter(summary => summary.owner === userId);
    } catch (error) {
      console.error('Error fetching summaries by owner ID:', error);
      throw error;
    }
  }

  export async function fetchRepositoriesByOwnerId(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch('http://localhost:5000/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await response.json();
      return allRepositories.filter(repo => repo.owner === userId);
    } catch (error) {
      console.error('Error fetching repositories by owner ID:', error);
      throw error;
    }
  }

  export async function updateUserWithCascade(updatedUser: User): Promise<User> {
    try {
      // Update user
      const userResponse = await fetch(`${mockApiUrl}/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (!userResponse.ok) {
        throw new Error('Failed to update user');
      }
  
      // Update summaries
      const summariesResponse = await fetch('http://localhost:5000/summeries');
      if (!summariesResponse.ok) {
        throw new Error('Failed to fetch summaries');
      }
      const summaries: Summary[] = await summariesResponse.json();
      
      const updatedSummaries = summaries.map(summary => {
        if (summary.owner === updatedUser.id) {
          return { ...summary, author: updatedUser.name };
        }
        return summary;
      });
  
      await Promise.all(updatedSummaries.map(summary => 
        fetch(`http://localhost:5000/summeries/${summary.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        })
      ));
  
      // Update repositories
      const reposResponse = await fetch('http://localhost:5000/repositories');
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const repositories: Repository[] = await reposResponse.json();
      
      const updatedRepositories = repositories.map(repo => {
        if (repo.owner === updatedUser.id) {
          return { ...repo, owner: updatedUser.id };
        }
        return repo;
      });
  
      await Promise.all(updatedRepositories.map(repo => 
        fetch(`http://localhost:5000/repositories/${repo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(repo),
        })
      ));
  
      // Update comments
      const commentsResponse = await fetch('http://localhost:5000/comments');
      if (!commentsResponse.ok) {
        throw new Error('Failed to fetch comments');
      }
      const comments: Comment[] = await commentsResponse.json();
  
      const updatedComments = comments.map(comment => {
        if (comment.author === updatedUser.id) {
          return { ...comment, author: updatedUser.name };
        }
        return comment;
      });
  
      await Promise.all(updatedComments.map(comment => 
        fetch(`http://localhost:5000/comments/${comment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(comment),
        })
      ));
  
      console.log("User updated successfully with cascading changes");
      return updatedUser;
    } catch (error) {
      console.error("Error updating user with cascade:", error);
      throw error;
    }
  }

  export async function updateUser(updatedUser: User): Promise<User> {
    const response = await fetch(`${mockApiUrl}/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })
    if (!response.ok) {
      throw new Error('Failed to update user')
    }
    return await response.json()
  }

  async function getSummaryWithFullComments(summaryId: string) {
    const summary = await fetchSummaryById(summaryId);
    if (summary) {
      const fullComments = await fetchCommentsByIds(summary.comments);
      return { ...summary, fullComments };
    }
    return null;
  }

  export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await fetchUserById(userId)
    if (!user) throw new Error('User not found')
  
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) throw new Error('Incorrect old password')
  
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
  
    user.password = hashedPassword
  
    await updateUser(user)
    return true
  }

  export async function fetchCommentsByIds(commentIds: string[]): Promise<Comment[]> {
    try {
      // Fetch all comments
      const response = await fetch('http://localhost:5000/comments');
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const allComments: Comment[] = await response.json();
      
      // Filter comments based on the provided comment IDs
      const filteredComments = allComments.filter(comment => commentIds.includes(comment.id));
      
      // If any comment IDs were not found, log a warning
      const foundIds = filteredComments.map(comment => comment.id);
      const missingIds = commentIds.filter(id => !foundIds.includes(id));
      if (missingIds.length > 0) {
        console.warn(`Some comment IDs were not found: ${missingIds.join(', ')}`);
      }
      
      return filteredComments;
    } catch (error) {
      console.error('Error fetching comments by IDs:', error);
      throw error;
    }
  }

  export async function fetchSummaryById(id: string): Promise<Summary | null> {
    try {
      const response = await fetch(`http://localhost:5000/summeries/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch summary');
      }
      const summary: Summary = await response.json();
      
      // The summary already contains the comment IDs, so we don't need to do anything else
      return summary;
    } catch (error) {
      console.error('Error fetching summary by ID:', error);
      throw error;
    }
  }

  export async function addCommentToSummary(summaryId: string, newComment: Omit<Comment, 'id'>): Promise<Summary> {
    try {
      const summaryResponse = await fetch(`http://localhost:5000/summeries/${summaryId}`);
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch summary');
      }
      const summary: Summary = await summaryResponse.json();
  
      // Create a new comment
      const commentId = Date.now().toString();
      const fullComment: Comment = { ...newComment, id: commentId };
  
      // Add the new comment to the comments collection
      const addCommentResponse = await fetch('http://localhost:5000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullComment),
      });
  
      if (!addCommentResponse.ok) {
        throw new Error('Failed to add new comment');
      }
  
      // Update the summary with the new comment ID
      summary.comments.push(commentId);
  
      const updateSummaryResponse = await fetch(`http://localhost:5000/summeries/${summaryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summary),
      });
  
      if (!updateSummaryResponse.ok) {
        throw new Error('Failed to update summary data');
      }
  
      // Create notification for the summary owner
      const newNotification: Omit<Notification, 'id'> = {
        date: new Date().toISOString(),
        read: false,
        content: `${newComment.author} commented on your summary "${summary.title}"`,
        link: `/summary/${summaryId}`,
        sender: newComment.author,
        type: 'comment'
      };
  
      await addNotification(summary.owner, newNotification);
  
      return await updateSummaryResponse.json();
    } catch (error) {
      console.error('Error adding comment to summary:', error);
      throw error;
    }
  }

  export async function likeSummary(summaryId: string, userId: string): Promise<{ summary: Summary; user: User; owner: User }> {
    try {
      console.log(`Attempting to like/unlike summary ${summaryId} by user ${userId}`);
  
      const [summaryResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!summaryResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch summary or user data');
      }
  
      const summary: Summary = await summaryResponse.json();
      let user: User = await userResponse.json();
  
      console.log('Fetched summary:', summary);
      console.log('Fetched user:', user);
  
      const ownerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch summary owner data');
      }
      let owner: User = await ownerResponse.json();
  
      console.log('Fetched owner:', owner);
  
      const isLiked = user.likedSummaries.includes(summaryId);
      const isOwnSummary = userId === summary.owner;
  
      console.log('Is liked:', isLiked);
      console.log('Is own summary:', isOwnSummary);
  
      if (isLiked) {
        if (!isOwnSummary) {
          summary.likes--;
          owner.totalLikes--;
        }
        user.likedSummaries = user.likedSummaries.filter(id => id !== summaryId);
        console.log('Summary unliked');
      } else {
        if (!isOwnSummary) {
          summary.likes++;
          owner.totalLikes++;
  
          const newNotification: Omit<Notification, 'id'> = {
            date: new Date().toISOString(),
            read: false,
            content: `${user.name} liked your summary "${summary.title}"`,
            link: `/summary/${summaryId}`,
            sender: user.username,
            type: 'like'
          };
  
          console.log('Creating new notification:', newNotification);
  
          try {
            const notificationId = await addNotification(summary.owner, newNotification);
            console.log(`Notification created with ID: ${notificationId}`);
            
            // Fetch the updated owner data after adding the notification
            const updatedOwnerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
            if (updatedOwnerResponse.ok) {
              owner = await updatedOwnerResponse.json();
              console.log('Updated owner after notification:', owner);
            }
          } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Continue with the like process even if notification fails
          }
        }
        user.likedSummaries.push(summaryId);
        console.log('Summary liked');
      }
  
      console.log('Updated user liked summaries:', user.likedSummaries);
  
      const [updatedSummaryResponse, updatedUserResponse, updatedOwnerResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        }),
        fetch(`http://localhost:5000/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        }),
        fetch(`http://localhost:5000/users/${summary.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        })
      ]);
  
      if (!updatedSummaryResponse.ok || !updatedUserResponse.ok || !updatedOwnerResponse.ok) {
        throw new Error('Failed to update summary, user, or owner data');
      }
  
      const updatedSummary = await updatedSummaryResponse.json();
      const updatedUser = await updatedUserResponse.json();
      const updatedOwner = await updatedOwnerResponse.json();
  
      console.log('Updated summary:', updatedSummary);
      console.log('Updated user:', updatedUser);
      console.log('Updated owner:', updatedOwner);
  
      return {
        summary: updatedSummary,
        user: updatedUser,
        owner: updatedOwner
      };
    } catch (error) {
      console.error('Error liking/unliking summary:', error);
      throw error;
    }
  }

  export async function viewSummary(summaryId: string, userId: string): Promise<{ summary: Summary; user: User; owner: User }> {
    try {
      const [summaryResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);

      if (!summaryResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch summary or user data');
      }

      const summary: Summary = await summaryResponse.json();
      const user: User = await userResponse.json();

      // Fetch the summary owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch summary owner data');
      }
      const owner: User = await ownerResponse.json();

      let summaryUpdated = false;
      let ownerUpdated = false;

      // Check if the viewer is not the owner of the summary
      if (userId !== summary.owner) {
        // Increment view count for the summary
        summary.views++;
        summaryUpdated = true;

        // Increment total views for the owner
        owner.totalViews++;
        ownerUpdated = true;
      }

      const updatePromises = [];

      if (summaryUpdated) {
        updatePromises.push(
          fetch(`http://localhost:5000/summeries/${summaryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(summary),
          })
        );
      }

      if (ownerUpdated) {
        updatePromises.push(
          fetch(`http://localhost:5000/users/${summary.owner}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(owner),
          })
        );
      }

      if (updatePromises.length > 0) {
        const updateResponses = await Promise.all(updatePromises);
        if (!updateResponses.every(response => response.ok)) {
          throw new Error('Failed to update summary or owner data');
        }
      }

      return {
        summary: summaryUpdated ? await updatePromises[0].then(res => res.json()) : summary,
        user: user, // Return the original user object as we didn't modify it
        owner: ownerUpdated ? await updatePromises[1].then(res => res.json()) : owner
      };
    } catch (error) {
      console.error('Error updating view count:', error);
      throw error;
    }
  }

  export async function saveSummary(summaryId: string, userId: string): Promise<User> {
    try {
      const userResponse = await fetch(`http://localhost:5000/users/${userId}`);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const user: User = await userResponse.json();

      if (user.savedSummaries.includes(summaryId)) {
        // Unsave the summary
        user.savedSummaries = user.savedSummaries.filter(id => id !== summaryId);
      } else {
        // Save the summary
        user.savedSummaries.push(summaryId);
      }

      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!updatedUserResponse.ok) {
        throw new Error('Failed to update user data');
      }

      return await updatedUserResponse.json();
    } catch (error) {
      console.error('Error saving/unsaving summary:', error);
      throw error;
    }
  }

  export async function likeRepository(repoId: string, userId: string): Promise<{ repository: Repository; user: User; owner: User }> {
    try {
      const [repoResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/repositories/${repoId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!repoResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch repository or user data');
      }
  
      const repository: Repository = await repoResponse.json();
      const user: User = await userResponse.json();
  
      // Fetch the owner data
      const ownerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch repository owner data');
      }
      const owner: User = await ownerResponse.json();
  
      const isLiked = user.likedRepositories.includes(repoId);
      const isOwnRepository = userId === repository.owner;
  
      if (isLiked) {
        // Unlike the repository
        repository.likes = Math.max(0, repository.likes - 1);
        user.likedRepositories = user.likedRepositories.filter(id => id !== repoId);
        if (!isOwnRepository) {
          owner.totalLikes = Math.max(0, owner.totalLikes - 1);
        }
      } else {
        // Like the repository
        repository.likes++;
        user.likedRepositories.push(repoId);
        if (!isOwnRepository) {
          owner.totalLikes++;
        }
      }
  
      // Always update the repository, regardless of who likes it
      const updatedRepoResponse = await fetch(`http://localhost:5000/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repository),
      });
  
      // Always update the user who performed the action
      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      // Only update the owner if it's not the same as the user who performed the action
      let updatedOwnerResponse;
      if (!isOwnRepository) {
        updatedOwnerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        });
      }
  
      if (!updatedRepoResponse.ok || !updatedUserResponse.ok || (!isOwnRepository && !updatedOwnerResponse?.ok)) {
        throw new Error('Failed to update repository, user, or owner data');
      }
  
      return {
        repository: await updatedRepoResponse.json(),
        user: await updatedUserResponse.json(),
        owner: isOwnRepository ? owner : await updatedOwnerResponse!.json()
      };
    } catch (error) {
      console.error('Error liking/unliking repository:', error);
      throw error;
    }
  }

  export async function saveRepository(repoId: string, userId: string): Promise<User> {
    try {
      const userResponse = await fetch(`http://localhost:5000/users/${userId}`);
  
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const user: User = await userResponse.json();
  
      if (user.savedRepositories.includes(repoId)) {
        // Unsave the repository
        user.savedRepositories = user.savedRepositories.filter(id => id !== repoId);
      } else {
        // Save the repository
        user.savedRepositories.push(repoId);
      }
  
      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      if (!updatedUserResponse.ok) {
        throw new Error('Failed to update user data');
      }
  
      return await updatedUserResponse.json();
    } catch (error) {
      console.error('Error saving/unsaving repository:', error);
      throw error;
    }
  }
  
  export async function viewRepository(repoId: string, userId: string): Promise<{ repository: Repository; user: User; owner: User }> {
    try {
      const [repoResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/repositories/${repoId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!repoResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch repository or user data');
      }
  
      const repository: Repository = await repoResponse.json();
      const user: User = await userResponse.json();
  
      // Fetch the repository owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch repository owner data');
      }
      const owner: User = await ownerResponse.json();
  
      // Increment view count for the repository
      repository.views++;
  
      // Increment total views for the owner
      owner.totalViews = (owner.totalViews || 0) + 1;
  
      const updatePromises = [
        fetch(`http://localhost:5000/repositories/${repoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(repository),
        }),
        fetch(`http://localhost:5000/users/${repository.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        })
      ];
  
      const updateResponses = await Promise.all(updatePromises);
      if (!updateResponses.every(response => response.ok)) {
        throw new Error('Failed to update repository or owner data');
      }
  
      const [updatedRepository, updatedOwner] = await Promise.all(
        updateResponses.map(response => response.json())
      );
  
      return {
        repository: updatedRepository,
        user: user, // Return the original user object as we didn't modify it
        owner: updatedOwner
      };
    } catch (error) {
      console.error('Error updating view count:', error);
      throw error;
    }
  }

  export async function updateRepository(id: string, updatedData: Partial<Repository>): Promise<Repository> {
    try {
      const response = await fetch(`http://localhost:5000/repositories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedRepository: Repository = await response.json();
      return updatedRepository;
    } catch (error) {
      console.error('Error updating repository:', error);
      throw error;
    }
  }

  export async function fetchUserRepositories(userId: string) {
    try {
      const response = await fetch(`http://localhost:5000/repositories?owner=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user repositories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  }

  export function formatDate(date: string | Date): string {
    let d: Date;
  
    if (typeof date === 'string') {
      // Check if the date is already in "dd-mm-yyyy" format
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date; // Already in the correct format, return as is
      }
      // Parse the string date
      d = new Date(date);
    } else {
      d = date;
    }
  
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid Date';
    }
  
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
  
    return `${year}-${month}-${day}`;
  }


  export async function addSummary(
    newSummary: Omit<Summary, 'id' | 'views' | 'likes' | 'comments' | 'dateCreated' | 'lastUpdated'>,
    repoId?: string,
    folderId?: string
  ): Promise<Summary> {
    try {
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);
  
      const summaryResponse = await fetch('http://localhost:5000/summeries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSummary,
          id: Date.now().toString(),
          views: 0,
          likes: 0,
          comments: [],
          dateCreated: formattedDate,
          lastUpdated: formattedDate,
        }),
      });
  
      if (!summaryResponse.ok) {
        throw new Error(`Failed to add new summary: ${summaryResponse.statusText}`);
      }
  
      const addedSummary: Summary = await summaryResponse.json();
  
      // Update the user's summariesCount
      const userResponse = await fetch(`http://localhost:5000/users/${newSummary.owner}`);
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.statusText}`);
      }
      const userData: User = await userResponse.json();
      
      userData.summariesCount = (userData.summariesCount || 0) + 1;
  
      // Fetch all users
      const allUsersResponse = await fetch('http://localhost:5000/users');
      if (!allUsersResponse.ok) {
        throw new Error('Failed to fetch all users');
      }
      const allUsers: User[] = await allUsersResponse.json();
      console.log("Wayyyyyyyy1?")
      if(!newSummary.isPrivate){
        console.log("Wayyyyyyyy2?")
      // Create notifications for followers
      const followerNotifications = allUsers
        .filter(user => user.followingId && user.followingId.includes(newSummary.owner))
        .map(async (follower) => {
          const newNotification: Omit<Notification, 'id'> = {
            date: new Date().toISOString(),
            read: false,
            content: `${userData.name} posted a new summary: "${addedSummary.title}"`,
            link: `/summary/${addedSummary.id}`,
            sender: userData.name,
            type: 'summary'
          };
          await addNotification(follower.id, newNotification);
        });
      
      
  
      const updatePromises = [
        fetch(`http://localhost:5000/users/${newSummary.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }),
        ...followerNotifications
      ];

  
      await Promise.all(updatePromises);
    }
  
      // Handle repository update separately
      if (repoId) {
        await updateRepositoryToAddSummary(repoId, addedSummary, folderId);
      }
  
      return addedSummary;
    } catch (error) {
      console.error('Error adding new summary:', error);
      throw error;
    }
  }
  
  export async function updateRepositoryToAddSummary(repoId: string, summary: Summary, folderId?: string): Promise<Repository> {
    try {
      const repoResponse = await fetch(`http://localhost:5000/repositories/${repoId}`);
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
      }
      const repo: Repository = await repoResponse.json();
  
      const newItem: RepositoryItem = {
        id: summary.id,
        title: summary.title,
        description: summary.description,
        author: summary.author,
        owner: summary.owner,
        lastUpdated: summary.lastUpdated,
        views: summary.views,
        likes: summary.likes,
        isPrivate: summary.isPrivate,
        comments: summary.comments.length,
        path: [],
      };
  
      if (folderId) {
        const folder = findFolderById(repo.rootFolder, folderId);
        if (folder) {
          folder.items.push(newItem);
          newItem.path = getFolderPath(repo.rootFolder, folderId);
        } else {
          throw new Error(`Folder with ID ${folderId} not found in repository`);
        }
      } else {
        repo.rootFolder.items.push(newItem);
        newItem.path = [repo.rootFolder.name];
      }
  
      const updateResponse = await fetch(`http://localhost:5000/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repo),
      });
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update repository: ${updateResponse.statusText}`);
      }
  
      return await updateResponse.json();
    } catch (error) {
      console.error('Error updating repository to add summary:', error);
      throw error;
    }
  }
  
  function findFolderById(folder: RepositoryFolder, id: string): RepositoryFolder | null {
    if (folder.id === id) {
      return folder;
    }
    for (const item of folder.items) {
      if ('items' in item) {
        const found = findFolderById(item, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
  
  function getFolderPath(rootFolder: RepositoryFolder, folderId: string): string[] {
    const path: string[] = [];
  
    function traverse(folder: RepositoryFolder, currentPath: string[]) {
      if (folder.id === folderId) {
        path.push(...currentPath, folder.name);
        return true;
      }
  
      for (const item of folder.items) {
        if ('items' in item) {
          if (traverse(item, [...currentPath, folder.name])) {
            return true;
          }
        }
      }
  
      return false;
    }
  
    traverse(rootFolder, []);
    return path;
  }


export async function fetchUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await fetchUsers();
    const foundUser = users.find((u) => u.username === username);
    return foundUser || null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

export async function followUser(userId: string, followerId: string): Promise<{ follower: User; followedUser: User }> {
  try {
    console.log(`Attempting to follow user ${userId} by follower ${followerId}`);

    const [userResponse, followerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/users/${followerId}`)
    ]);

    if (!userResponse.ok || !followerResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    let user: User = await userResponse.json();
    let follower: User = await followerResponse.json();

    console.log('User to be followed:', user);
    console.log('Follower:', follower);

    // Check if already following
    if (follower.followingId.includes(userId)) {
      console.log('Already following this user');
      return { follower, followedUser: user };
    }

    follower.following = (follower.following || 0) + 1;
    follower.followingId = Array.isArray(follower.followingId) 
      ? [...follower.followingId, userId] 
      : [userId];

    user.followers = (user.followers || 0) + 1;
    user.followerIds = Array.isArray(user.followerIds) 
      ? [...user.followerIds, followerId] 
      : [followerId];

    console.log('Updated user:', user);
    console.log('Updated follower:', follower);

    const newNotification: Omit<Notification, 'id'> = {
      date: new Date().toISOString(),
      read: false,
      content: `${follower.name} started following you!`,
      link: `/profile/${follower.username}`,
      sender: follower.username,
      type: 'follow'
    };

    console.log('Creating new notification:', newNotification);

    const notificationId = await addNotification(userId, newNotification);
    console.log(`Notification created with ID: ${notificationId}`);

    // Ensure the notification is added to the user's notificationIds array
    user.notificationIds = Array.isArray(user.notificationIds)
      ? [...user.notificationIds, notificationId]
      : [notificationId];

    // Update both user and follower in the database
    const [updateUserResponse, updateFollowerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/users/${followerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(follower),
      })
    ]);

    if (!updateUserResponse.ok || !updateFollowerResponse.ok) {
      throw new Error('Failed to update user or follower data');
    }

    // Fetch the final updated user and follower data
    const [finalUserResponse, finalFollowerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/users/${followerId}`)
    ]);

    if (!finalUserResponse.ok || !finalFollowerResponse.ok) {
      throw new Error('Failed to fetch final updated user or follower data');
    }

    user = await finalUserResponse.json();
    follower = await finalFollowerResponse.json();

    console.log(`User ${followerId} successfully followed user ${userId}`);
    console.log('Final updated user:', user);
    console.log('Final updated follower:', follower);

    return { follower, followedUser: user };
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: string, followerId: string): Promise<{ follower: User; unfollowedUser: User }> {
  try {
    const [userResponse, followerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/users/${followerId}`)
    ]);

    if (!userResponse.ok || !followerResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user: User = await userResponse.json();
    const follower: User = await followerResponse.json();

    // Update follower's data
    follower.following--;
    follower.followingId = follower.followingId.filter(id => id !== userId);

    // Update user's data
    user.followers--;
    user.followerIds = user.followerIds.filter(id => id !== followerId);

    // Update both users in the database
    const [updateUserResponse, updateFollowerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/users/${followerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(follower),
      })
    ]);

    if (!updateUserResponse.ok || !updateFollowerResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return { follower, unfollowedUser: user };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function inviteCollaborator(repoId: string, username: string): Promise<Repository> {
  // Fetch the repository
  const repo = await fetchRepositoryById(repoId);
  if (!repo) {
    throw new Error('Repository not found');
  }

  // Fetch the user to be invited
  const user = await fetchUserByUsername(username);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if the user is already a collaborator or has a pending invitation
  if (repo.collaborators.includes(user.id) || repo.pendingCollaborators.includes(user.id)) {
    throw new Error('User is already a collaborator or has a pending invitation');
  }

  // Add the user to pending collaborators
  const updatedPendingCollaborators = [...repo.pendingCollaborators, user.id];
  const updatedRepo = await updateRepository(repoId, { pendingCollaborators: updatedPendingCollaborators });

  // Create a notification for the invited user
  const newNotification: Omit<Notification, 'id'> = {
    type: 'collaboration_invite',
    content: `You've been invited to collaborate on the repository "${repo.name}"`,
    date: new Date().toISOString(),
    read: false,
    sender: repo.author,
    link: `/collaboration-request/${repoId}?userId=${user.id}`
  };

  // Add the notification using the new centralized system
  await addNotification(user.id, newNotification);

  return updatedRepo;
}

export async function removeCollaborator(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.collaborators = repo.collaborators.filter(id => id !== userId)
  return await updateRepository(repoId, { collaborators: repo.collaborators })
}

export async function cancelCollaborationInvitation(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.pendingCollaborators = repo.pendingCollaborators.filter(id => id !== userId)
  return await updateRepository(repoId, { pendingCollaborators: repo.pendingCollaborators })
}

export async function acceptCollaboration(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.pendingCollaborators = repo.pendingCollaborators.filter(id => id !== userId)
  repo.collaborators.push(userId)
  return await updateRepository(repoId, {
    pendingCollaborators: repo.pendingCollaborators,
    collaborators: repo.collaborators
  })
}

export async function rejectCollaboration(repoId: string, userId: string): Promise<Repository> {
  return await cancelCollaborationInvitation(repoId, userId)
}

export async function fetchCollaborationRequest(repoId: string, userId: string): Promise<{ repository: Repository; inviter: User }> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  const inviter = await fetchUserById(repo.owner)
  if (!inviter) {
    throw new Error('Inviter not found')
  }
  return { repository: repo, inviter }
}

export async function fetchComments(commentIds: string[]): Promise<Comment[]> {
  try {
    const response = await fetch('http://localhost:5000/comments');
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    const allComments: Comment[] = await response.json();
    return allComments.filter(comment => commentIds.includes(comment.id));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function fetchCommunities(): Promise<Community[]> {
  try {
    const response = await fetch('http://localhost:5000/communities');
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
}

export async function fetchCommunityById(id: string): Promise<Community | null> {
  try {
    const response = await fetch(`http://localhost:5000/communities/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching community by ID:', error);
    throw error;
  }
}

export async function joinCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is already a member
    if (community.members.includes(userId)) {
      throw new Error('User is already a member of this community');
    }

    // Check the join policy
    if (community.joinPolicy !== 'open') {
      throw new Error('This community requires an invitation or request to join');
    }

    // Update user's communities
    user.communities.push(communityId);

    // Update community's members and totalMembers
    community.members.push(userId);
    community.totalMembers += 1;

    // Update both user and community in the database
    const [updatedUserResponse, updatedCommunityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(community),
      })
    ]);

    if (!updatedUserResponse.ok || !updatedCommunityResponse.ok) {
      throw new Error('Failed to update user or community data');
    }

    return {
      user: await updatedUserResponse.json(),
      community: await updatedCommunityResponse.json()
    };
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
}

export async function leaveCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is a member
    if (!community.members.includes(userId)) {
      throw new Error('User is not a member of this community');
    }

    // Update user's communities
    user.communities = user.communities.filter(id => id !== communityId);

    // Update community's members and totalMembers
    community.members = community.members.filter(id => id !== userId);
    community.totalMembers -= 1;

    // Update both user and community in the database
    const [updatedUserResponse, updatedCommunityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(community),
      })
    ]);

    if (!updatedUserResponse.ok || !updatedCommunityResponse.ok) {
      throw new Error('Failed to update user or community data');
    }

    return {
      user: await updatedUserResponse.json(),
      community: await updatedCommunityResponse.json()
    };
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
}

// Add this function to db.ts
export async function requestToJoinCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is already a member or has a pending request
    if (community.members.includes(userId) || community.pendingMembers?.includes(userId)) {
      throw new Error('User is already a member or has a pending request');
    }

    // Add user to pendingMembers
    community.pendingMembers = community.pendingMembers || [];
    community.pendingMembers.push(userId);

    // Update community in the database
    const updateCommunityResponse = await fetch(`http://localhost:5000/communities/${communityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(community),
    });

    if (!updateCommunityResponse.ok) {
      throw new Error('Failed to update community data');
    }

    return { user, community: await updateCommunityResponse.json() };
  } catch (error) {
    console.error('Error requesting to join community:', error);
    throw error;
  }
}

export async function acceptJoinRequest(communityId: string, requesterId: string, adminId: string): Promise<Community> {
  try {
    console.log(`Accepting join request for community ${communityId} from user ${requesterId} by admin ${adminId}`);

    const [communityResponse, requesterResponse] = await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`),
      fetch(`http://localhost:5000/users/${requesterId}`)
    ]);

    if (!communityResponse.ok || !requesterResponse.ok) {
      throw new Error('Failed to fetch community or requester data');
    }

    let community: Community = await communityResponse.json();
    let requester: User = await requesterResponse.json();

    console.log('Community before update:', community);
    console.log('Requester before update:', requester);

    // Remove requester from pendingMembers and add to members
    community.pendingMembers = community.pendingMembers?.filter(id => id !== requesterId) || [];
    if (!community.members.includes(requesterId)) {
      community.members.push(requesterId);
      community.totalMembers += 1;
    }

    // Add community to requester's communities
    if (!requester.communities) {
      requester.communities = [];
    }
    if (!requester.communities.includes(communityId)) {
      requester.communities.push(communityId);
    }

    console.log('Community after update:', community);
    console.log('Requester after update:', requester);

    // Create a notification for the requester
    const newNotification: Omit<Notification, 'id'> = {
      type: 'join_accepted',
      content: `Your request to join ${community.name} has been accepted.`,
      date: new Date().toISOString(),
      read: false,
      sender: adminId,
      link: `/community/${communityId}`
    };

    console.log('Creating new notification:', newNotification);

    // Add the notification using the new centralized system
    const notificationId = await addNotification(requesterId, newNotification);
    console.log(`Notification created with ID: ${notificationId}`);

    // Ensure the requester's notificationIds array is initialized
    if (!requester.notificationIds) {
      requester.notificationIds = [];
    }

    // Add the new notification ID to the requester's notificationIds array
    requester.notificationIds.push(notificationId);

    console.log('Requester after adding notification:', requester);

    // Update both community and requester in the database
    const [updatedCommunityResponse, updatedRequesterResponse] = await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(community),
      }),
      fetch(`http://localhost:5000/users/${requesterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requester),
      })
    ]);

    if (!updatedCommunityResponse.ok || !updatedRequesterResponse.ok) {
      throw new Error('Failed to update community or requester data');
    }

    const updatedCommunity: Community = await updatedCommunityResponse.json();
    const updatedRequester: User = await updatedRequesterResponse.json();

    console.log('Final updated community:', updatedCommunity);
    console.log('Final updated requester:', updatedRequester);

    // Verify that the notification ID was added to the user's notificationIds
    if (!updatedRequester.notificationIds.includes(notificationId)) {
      console.error('Notification ID was not added to user\'s notificationIds array');
      throw new Error('Failed to add notification ID to user\'s notificationIds array');
    }

    console.log('Join request accepted successfully');
    return updatedCommunity;
  } catch (error) {
    console.error('Error accepting join request:', error);
    throw error;
  }
}

export async function rejectJoinRequest(communityId: string, requesterId: string, adminId: string): Promise<Community> {
  try {
    console.log(`Rejecting join request for community ${communityId} from user ${requesterId} by admin ${adminId}`);

    const communityResponse = await fetch(`http://localhost:5000/communities/${communityId}`);

    if (!communityResponse.ok) {
      throw new Error('Failed to fetch community data');
    }

    let community: Community = await communityResponse.json();

    console.log('Community before update:', community);

    // Remove requester from pendingMembers
    community.pendingMembers = community.pendingMembers?.filter(id => id !== requesterId) || [];

    console.log('Community after update:', community);

    // Create a notification for the requester
    const newNotification: Omit<Notification, 'id'> = {
      type: 'join_rejected',
      content: `Your request to join ${community.name} has been rejected.`,
      date: new Date().toISOString(),
      read: false,
      sender: adminId,
      link: `/community/${communityId}`
    };

    console.log('Creating new notification:', newNotification);

    // Add the notification using the new centralized system
    const notificationId = await addNotification(requesterId, newNotification);
    console.log(`Notification created with ID: ${notificationId}`);

    // Update community in the database
    const updatedCommunityResponse = await fetch(`http://localhost:5000/communities/${communityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(community),
    });

    if (!updatedCommunityResponse.ok) {
      throw new Error('Failed to update community data');
    }

    const updatedCommunity: Community = await updatedCommunityResponse.json();

    console.log('Join request rejected successfully');
    return updatedCommunity;
  } catch (error) {
    console.error('Error rejecting join request:', error);
    throw error;
  }
}

export async function updateCommunity(id: string, updatedData: Partial<Community>): Promise<Community> {
  try {
    const response = await fetch(`http://localhost:5000/communities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
}

export async function addCommunity(newCommunity: Omit<Community, 'id'>): Promise<Community> {
  try {
    // Create the new community
    const communityResponse = await fetch('http://localhost:5000/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newCommunity,
        id: Date.now().toString(),
      }),
    });

    if (!communityResponse.ok) {
      throw new Error('Failed to create new community');
    }

    const createdCommunity: Community = await communityResponse.json();

    // Fetch the user data
    const userResponse = await fetch(`http://localhost:5000/users/${newCommunity.admins[0]}`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData: User = await userResponse.json();

    // Update the user's communities array
    userData.communities = [...userData.communities, createdCommunity.id];

    // Save the updated user data
    const updateUserResponse = await fetch(`http://localhost:5000/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!updateUserResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return createdCommunity;
  } catch (error) {
    console.error('Error creating new community:', error);
    throw error;
  }
}


export async function addRepository(newRepo: Omit<Repository, 'id' | 'collaborators' | 'pendingCollaborators'>, communityId?: string): Promise<Repository> {
  try {
    const response = await fetch('http://localhost:5000/repositories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newRepo,
        id: Date.now().toString(),
        collaborators: [],
        pendingCollaborators: [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create new repository');
    }

    const createdRepo: Repository = await response.json();

    if (communityId) {
      await updateCommunityRepositories(communityId, createdRepo.id);
    }

    return createdRepo;
  } catch (error) {
    console.error('Error creating new repository:', error);
    throw error;
  }
}

async function updateCommunityRepositories(communityId: string, repoId: string): Promise<void> {
  const communityResponse = await fetch(`http://localhost:5000/communities/${communityId}`);
  if (!communityResponse.ok) {
    throw new Error('Failed to fetch community data');
  }
  const community: Community = await communityResponse.json();
  
  community.repositories.push(repoId);
  community.totalContent += 1;

  const updateCommunityResponse = await fetch(`http://localhost:5000/communities/${communityId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(community),
  });

  if (!updateCommunityResponse.ok) {
    throw new Error('Failed to update community data');
  }
}

export async function fetchNotifications(notificationIds: string[]): Promise<Notification[]> {
  try {
    const response = await fetch('http://localhost:5000/notifications');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const allNotifications: Notification[] = await response.json();
    
    // Filter the notifications based on the provided IDs
    const userNotifications = allNotifications.filter(notification => 
      notificationIds.includes(notification.id)
    );

    return userNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return []; // Return an empty array instead of throwing an error
  }
}

export async function addNotification(userId: string, notificationData: Omit<Notification, 'id'>): Promise<string> {
  try {
    console.log(`Adding notification for user ${userId}:`, notificationData);

    const notificationId = Date.now().toString();
    const newNotification: Notification = {
      id: notificationId,
      ...notificationData
    };

    // Add the new notification to the notifications store
    const notificationResponse = await fetch('http://localhost:5000/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotification),
    });

    if (!notificationResponse.ok) {
      throw new Error(`Failed to add notification to store: ${notificationResponse.statusText}`);
    }

    console.log('Notification added to store:', newNotification);

    // Fetch the current user data
    const userResponse = await fetch(`http://localhost:5000/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user data: ${userResponse.statusText}`);
    }
    let user: User = await userResponse.json();

    console.log('User before update:', user);

    // Update the notificationIds array
    if (!user.notificationIds) {
      user.notificationIds = [];
    }
    user.notificationIds.push(notificationId);

    console.log('User after update:', user);

    // Update the user object in the database
    const updateResponse = await fetch(`http://localhost:5000/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update user notifications: ${updateResponse.statusText}`);
    }

    console.log('User updated in database');

    // Fetch the updated user data to confirm the change
    const confirmedUserResponse = await fetch(`http://localhost:5000/users/${userId}`);
    if (!confirmedUserResponse.ok) {
      throw new Error(`Failed to fetch updated user data: ${confirmedUserResponse.statusText}`);
    }
    user = await confirmedUserResponse.json();

    console.log('Confirmed user after update:', user);

    if (!user.notificationIds.includes(notificationId)) {
      throw new Error('Notification ID was not added to user\'s notificationIds array');
    }

    console.log(`Notification added successfully: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
}


export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  try {
    console.log(`Attempting to mark notification ${notificationId} as read`);

    // First, fetch the current notification
    const fetchResponse = await fetch(`http://localhost:5000/notifications/${notificationId}`);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch notification: ${fetchResponse.statusText}`);
    }
    const notification: Notification = await fetchResponse.json();
    console.log('Current notification:', notification);

    // Update the notification's read status
    notification.read = true;

    // Send the update request
    const updateResponse = await fetch(`http://localhost:5000/notifications/${notificationId}`, {
      method: 'PUT', // Use PUT instead of PATCH for full resource update
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update notification: ${updateResponse.statusText}`);
    }

    const updatedNotification: Notification = await updateResponse.json();
    console.log('Updated notification:', updatedNotification);

    // Verify that the notification was actually marked as read
    if (!updatedNotification.read) {
      throw new Error('Notification was not successfully marked as read');
    }

    console.log(`Successfully marked notification ${notificationId} as read`);
    return updatedNotification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function fetchAllUserRepositories(userId: string): Promise<Repository[]> {
  try {
    const response = await fetch('http://localhost:5000/repositories');
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    const allRepositories: Repository[] = await response.json();
    
    return allRepositories.filter(repo => 
      repo.owner === userId || 
      (repo.collaborators && repo.collaborators.includes(userId))
    );
  } catch (error) {
    console.error('Error fetching all user repositories:', error);
    throw error;
  }
}
