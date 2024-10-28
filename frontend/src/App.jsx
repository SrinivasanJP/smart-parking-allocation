import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientPage from './routers/ClientPage'
import AdminPage from './routers/AdminPage'

const App = () => {
  return (
    <BrowserRouter>
    <Routes >
      <Route path="/" element={<ClientPage/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App