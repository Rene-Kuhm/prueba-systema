import { useEffect, useState } from 'react';

function AuthComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Only check if user is not already set
      if (!user) {
        const authUser = await getAuthStatus(); // Your auth check function
        setUser(authUser);
      }
    };
    
    checkAuth();
  }, [user]); // Add dependency array with user

  // ...existing code...
}

export default AuthComponent;
