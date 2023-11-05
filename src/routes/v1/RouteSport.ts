import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getParalympicSport,getParalympicSportById,createParalympicSports,updateParalympicSports,deleteParalympicSports, getParalympicSportByIdLandingPage, getAllParalympicNewsByType} from '../../controller/SportController'

export const router = Router()

router.get('/get',getParalympicSport)
router.get('/get/:id',getParalympicSportById)
router.post('/create',[checkJwt,createParalympicSports])
router.post('/update/:id',[checkJwt,updateParalympicSports])
router.delete('/delete/:id',[checkJwt,deleteParalympicSports])

router.get('/get-landing-page/:id',getParalympicSportByIdLandingPage)
router.get('/get-top-news',getAllParalympicNewsByType)

export default router