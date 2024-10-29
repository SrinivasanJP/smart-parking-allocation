import React, { useState } from 'react'
import AdminDashboard from '../components/pages/AdminDashboard';
import AdminAuth from '../components/pages/AdminAuth';

const AdminPage = () => {
  const [auth, setAuth] = useState(false);
  return auth? <AdminDashboard setAuth={setAuth}/>:<AdminAuth setAuth = {setAuth} /> 
}

export default AdminPage