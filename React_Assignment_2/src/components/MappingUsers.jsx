import React, { useState } from 'react'
import { USERS_DATA } from '../data/userData'; // Imported from data 

const MappingUsers = () => {

    const [showAdmin, setShowAdmin] = useState(false);
    const filteredUsers = showAdmin ? USERS_DATA.filter((user) => user.isAdmin === showAdmin) : USERS_DATA; // storing data as per isAdmin is true or false.
    return (
        <div>
            <div>
                <h5>Users List : </h5>
            </div>

            <button onClick={() => setShowAdmin((previous) => !previous)}>{showAdmin ? "Show all users" : "Show all admin"}</button>

            <div>
                <ul>
                    {filteredUsers.map((user) => { // maping the filtered data 
                        return (
                            <li key={user.id}>{user.name} ----------- {user.isAdmin ? "Admin" : "User"}</li> // in map index is required for uniquely identity.
                        )
                    })}
                </ul>
            </div>

        </div>
    )
}

export default MappingUsers;