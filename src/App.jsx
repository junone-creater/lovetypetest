import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import IntroPage from './pages/IntroPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import LandingPage from './pages/LandingPage'
import ApplyPage from './pages/ApplyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<IntroPage />} />
      <Route path="/quiz"    element={<QuizPage />} />
      <Route path="/result"  element={<ResultPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/apply"   element={<ApplyPage />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  )
}
