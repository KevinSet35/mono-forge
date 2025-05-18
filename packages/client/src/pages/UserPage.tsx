// File: packages/client/src/components/UserManager.tsx

import React, { useState } from 'react';
import axios from 'axios';
import {
    CreateUserRequest,
    User,
    ApiResponse,
    Gender,
    ResponseStatus
} from '@mono-forge/types'; // ← Importing shared types

// Create an axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateUserRequest>({
        name: '',
        email: '',
        password: '',
        gender: Gender.MALE,
        dateOfBirth: '1990-01-15'
    });

    // Function to fetch all users using Axios
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        console.log('In Fetch users');

        try {
            const response = await api.get<ApiResponse<User[]>>('/users');
            const data = response.data;
            console.log('---data---', data);

            if (ResponseStatus.SUCCESS === data.status && data.data) {
                setUsers(data.data);
            } else {
                setError(data.error?.message || 'Failed to create user');
            }
        } catch (err) {
            // Axios specific error handling
            if (axios.isAxiosError(err)) {
                setError(`Error fetching users: ${err.message} (${err.response?.status || 'unknown status'})`);
            } else {
                setError('Error fetching users: ' + (err instanceof Error ? err.message : String(err)));
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission using Axios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<ApiResponse<User>>('/users', formData);
            const data = response.data;
            console.log('---submitted---', data);

            if (ResponseStatus.SUCCESS === data.status && data.data) {
                // Clear form
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    gender: Gender.MALE,
                    dateOfBirth: '1990-01-15'
                });

                // Refresh user list
                fetchUsers();
            } else {
                setError(data.error?.message || 'Failed to create user');
            }
        } catch (err) {
            // Axios specific error handling
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    setError(`Server error: ${err.response.data.message || err.message} (${err.response.status})`);
                } else if (err.request) {
                    // The request was made but no response was received
                    setError('No response from server. Please try again later.');
                } else {
                    // Something happened in setting up the request
                    setError(`Error: ${err.message}`);
                }
            } else {
                setError('Error creating user: ' + (err instanceof Error ? err.message : String(err)));
            }
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString();
    };

    return (
        <div>
            <h1>User Management</h1>

            {/* Button to fetch users */}
            <button
                onClick={fetchUsers}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Fetch All Users'}
            </button>

            {/* Display error if any */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Display users */}
            <div>
                <h2>Users ({users.length})</h2>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            <strong>{user.name}</strong> - {user.email} |
                            Gender: {user.gender === Gender.MALE ? 'Male' : 'Female'} |
                            Born: {formatDate(user.dateOfBirth)}
                        </li>
                    ))}
                </ul>
                {users.length === 0 && !loading && <p>No users found. Click "Fetch All Users" or add a new user.</p>}
            </div>

            {/* Add user form */}
            <div>
                <h2>Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Password:
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Gender:
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value={Gender.MALE}>Male</option>
                                <option value={Gender.FEMALE}>Female</option>
                            </select>
                        </label>
                    </div>

                    <div>
                        <label>
                            Date of Birth:
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth || ''}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Add User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserPage;