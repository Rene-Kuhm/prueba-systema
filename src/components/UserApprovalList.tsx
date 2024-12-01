import { useState, useEffect } from 'react';
import {  databases, Query } from '@/lib/appwrite';
import { formatDate } from '@/utils/date';
import { Models } from 'appwrite';

const DATABASE_ID = '674c4eaa0026c50f8deb';
const COLLECTION_ID = '674c7786000a15e1fcb3,674c774b001c7ea2b044,674c77040028860b19f3,674c76310000f62ca7d6,674c752e002ef1ba9f56';

interface AppwriteUser extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  role?: string;
  approved: boolean;
}


// Interface for the processed user data
interface ProcessedUser {
  $id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  approved: boolean;
}

export function UserApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<ProcessedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);


  async function fetchPendingUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments<AppwriteUser>(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('approved', false)
        ],
      );

      if (response.documents) {
        // Process the user data to match the ProcessedUser interface
        const processedUsers: ProcessedUser[] =response.documents.map((user) => ({
          $id: user.$id,
          name: user.name,
          role: user.role || 'N/A',
          created_at: user.$createdAt,
          updated_at: user.$updatedAt,
          approved: user.approved || false,
          email: user.email,
        }));

        setPendingUsers(processedUsers);
      }
    } catch (error) {
      setError('Error fetching users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(userId: string) {
    try {
      await databases.updateDocument(
        'YOUR_DATABASE_ID',
        'YOUR_COLLECTION_ID',
        userId,
        { approved: true }
      );

      setPendingUsers((users) => users.filter((user) => user.$id !== userId));
    } catch (error) {
      console.error('Error:', error);
      alert('Error approving user');
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No pending users to approve
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
              Name
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
              Email
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
              Role
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
              Registration Date
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {pendingUsers.map((user) => (
            <tr key={user.$id}>
              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                {user.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                {user.email}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {user.role === 'admin' ? 'Admin' : 'Technician'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                {formatDate(new Date(user.created_at))}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button
                  onClick={() => approveUser(user.$id)}
                  className="font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  aria-label={`Approve user ${user.name}`}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}