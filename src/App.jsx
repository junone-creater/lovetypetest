import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import IntroPage from './pages/IntroPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import LandingPage from './pages/LandingPage'
import ApplyPage from './pages/ApplyPage'

// 페이지(라우트)가 바뀔 때마다 스크롤을 맨 위로 되돌린다
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/"        element={<IntroPage />} />
      <Route path="/quiz"    element={<QuizPage />} />
      <Route path="/result"  element={<ResultPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/apply"   element={<ApplyPage />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
