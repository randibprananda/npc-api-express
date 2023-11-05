import { Router } from 'express'
import { userSeeder } from '../../controller/userSeeder'

const router = Router()

router.get('/seed', userSeeder)

export default router
