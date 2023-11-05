import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getParalympicEvent,getParalympicEventById,createParalympicEvent,UpdateParalympicEvent,deletedparalympicEvent, getParalympicEventLandingPage} from '../../controller/EventController'


const router = Router()
router.get('/get',getParalympicEvent)
router.get('/get/:id',getParalympicEventById)
router.post('/create',[checkJwt,createParalympicEvent])
router.post('/update/:id',[checkJwt,UpdateParalympicEvent])
router.delete('/delete/:id',[checkJwt,deletedparalympicEvent])


router.get('/get-event-landing-page',getParalympicEventLandingPage)

export default router
