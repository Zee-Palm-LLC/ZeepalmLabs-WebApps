import Dashboard, { H as dashboardH } from './Dashboard.jsx'
import Schedule, { H as scheduleH } from './Schedule.jsx'
import MealPlanPage, { H as mealsH } from './MealPlanPage.jsx'
import MealDetail, { H as mealH } from './MealDetail.jsx'
import Trainers, { H as trainersH } from './Trainers.jsx'
import Exercises, { H as exercisesH } from './Exercises.jsx'
import Statistics, { H as statisticsH } from './Statistics.jsx'
import ClassDetail, { H as classesH } from './ClassDetail.jsx'
import Messages, { H as messagesH } from './Messages.jsx'
import Tracker, { H as trackerH } from './Tracker.jsx'
import TrainerDetail, { H as trainerH } from './TrainerDetail.jsx'

export const PAGES = {
  dashboard: { C: Dashboard, H: dashboardH, socialX: 919.5 },
  statistics: { C: Statistics, H: statisticsH, socialX: 1277 },
  exercises: { C: Exercises, H: exercisesH, socialX: 1277 },
  schedule: { C: Schedule, H: scheduleH, socialX: 979.5 },
  classes: { C: ClassDetail, H: classesH, socialX: 1277 },
  trainers: { C: Trainers, H: trainersH, socialX: 1277 },
  trainer: { C: TrainerDetail, H: trainerH, socialX: 1278.5 },
  messages: { C: Messages, H: messagesH, socialX: 1277 },
  tracker: { C: Tracker, H: trackerH, socialX: 1277 },
  meals: { C: MealPlanPage, H: mealsH, socialX: 1277 },
  meal: { C: MealDetail, H: mealH, socialX: 1277 },
}
