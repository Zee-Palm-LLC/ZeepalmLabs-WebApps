import { Greeting, SearchBar } from '../components/Header.jsx'
import { CaloriesCard, HeartCard, StepsCard } from '../components/StatCards.jsx'
import ActivityCard from '../components/ActivityCard.jsx'
import ProgressCard from '../components/ProgressCard.jsx'
import TodayCard from '../components/TodayCard.jsx'
import MealPlan from '../components/MealPlan.jsx'
import Classes from '../components/Classes.jsx'
import ProfilePanel from '../components/ProfilePanel.jsx'

export const H = 1290

export default function Dashboard() {
  return (
    <>
      <Greeting />
      <SearchBar />
      <CaloriesCard />
      <HeartCard />
      <StepsCard />
      <ActivityCard />
      <ProgressCard />
      <TodayCard />
      <MealPlan />
      <Classes />
      <ProfilePanel />
    </>
  )
}
