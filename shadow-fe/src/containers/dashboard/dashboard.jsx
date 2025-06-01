import { useState, useEffect } from 'react';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
const Dashboard = () => {
      const [loading, setLoading] = useState(true);
      return ( 
            <>
            {loading ? (
                  <CircularProgress isIndeterminate size='120px' thickness='4px' />
            ) : (
                  <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to your dashboard!</p>
                  </div>
            )}
                  
            </>
       );
}
 
export default Dashboard;