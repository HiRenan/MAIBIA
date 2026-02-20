import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { GamificationProvider } from './contexts/GamificationContext'
import Layout from './components/layout/Layout'
import Hero from './pages/Hero'
import SkillTree from './pages/SkillTree'
import QuestLog from './pages/QuestLog'
import Chronicle from './pages/Chronicle'
import GuildHall from './pages/GuildHall'
import Oracle from './pages/Oracle'
import TavernBoard from './pages/TavernBoard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <GamificationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/skills" element={<SkillTree />} />
          <Route path="/quests" element={<QuestLog />} />
          <Route path="/chronicle" element={<Chronicle />} />
          <Route path="/guild" element={<GuildHall />} />
          <Route path="/oracle" element={<Oracle />} />
          <Route path="/tavern" element={<TavernBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      </GamificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
