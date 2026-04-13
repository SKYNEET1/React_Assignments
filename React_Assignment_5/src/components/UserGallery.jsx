import React, { use } from "react";

// Fetch function
const fetchUsers = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  return res.json();
};

const userPromise = fetchUsers();

const UserGallery = () => {
  const users = use(userPromise);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {users.map((user) => (
        // map is used to iterate the data from api
        <div
          key={user.id}
          className="border rounded-lg p-6 shadow-md text-center bg-white"
        >
          {/* 👇 Cartoon Avatar (like your image) */}
          <div className="flex justify-center mb-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            //   external api for profile cartoons
              alt="avatar"
              className="w-20 h-20"
            />
          </div>

          {/* 👇 Info */}
          <p className="text-sm font-semibold">
            Name: {user?.name}
          </p>

          <p className="text-xs text-gray-600">
            Email: {user?.email}
          </p>

          <p className="text-xs">
            Phone: {user?.phone}
          </p>

          <p className="text-xs">
            Company: {user?.company?.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UserGallery;