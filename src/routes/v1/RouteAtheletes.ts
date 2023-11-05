import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {  getParalympicAtheletes,getParalympicAtheletesById,createPralympicAtheletes,updatePralympicAtheletes,deletePralympicAtheletes, getParalympicAtheletesLanding, getMedalStatistics }from '../../controller/AtheletesController'


const router = Router()

router.get('/get',getParalympicAtheletes)
router.get('/get/:id',getParalympicAtheletesById)
router.post('/create',[checkJwt,createPralympicAtheletes])
router.post('/update/:id',[checkJwt,updatePralympicAtheletes])
router.delete('/delete/:id',[checkJwt,deletePralympicAtheletes])
router.get('/get-statistic',getMedalStatistics)



router.get('/get-landing',getParalympicAtheletesLanding)

export default router