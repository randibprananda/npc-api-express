import {Router} from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getHeaderParalympic,getHeaderParalympicById,createParalympicHeader,updateHeaderParalympic,deleteHeaderParalympic} from '../../controller/HeaderController'


export  const router = Router()

router.get('/get',getHeaderParalympic)
router.get('/get/:id',getHeaderParalympicById)
router.post('/create',[checkJwt,createParalympicHeader])
router.post('/update/:id',[checkJwt,updateHeaderParalympic])
router.post('/delete/:id',[checkJwt,deleteHeaderParalympic])

export default router