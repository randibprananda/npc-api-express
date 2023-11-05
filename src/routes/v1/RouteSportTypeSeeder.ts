import { Router } from 'express'
import { sportSeeder } from '../../controller/SportTypeSeeder'

const router = Router()

router.get('/seed', sportSeeder)

export default router