import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SubjectSelector from './components/SubjectSelector';
import ScheduleDisplay from './components/ScheduleDisplay';
import ChatWootIntegration from './components/ChatWootIntegration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SubjectSelector />} />
        <Route path="/schedule" element={<ScheduleDisplay />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    <ChatWootIntegration /> 
    </Router>
  );
}

export default App;