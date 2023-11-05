import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getParalympicNews,getParalympicNewsById,createParalympicNews,updateParalympicNews,deleteParalympicNews, getParalympicNewsByIdLandingPage, getTopViewedNews} from '../../controller/NewsController'


const router = Router()
router.get('/get',getParalympicNews)
router.get('/get/:id',getParalympicNewsById)
router.post('/create',[checkJwt,createParalympicNews])
router.post('/update/:id',[checkJwt,updateParalympicNews])
router.delete('/delete/:id',[checkJwt,deleteParalympicNews])

router.get('/get-landing-page/:id',getParalympicNewsByIdLandingPage)
router.get('/get-top-news',getTopViewedNews)


export default router