import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {importAtheletes,uploadFile} from '../../controller/ImportAtheletesController'


const router = Router()

router.post('/import-data-atheletes',uploadFile.single('file'),[checkJwt,importAtheletes])

export default router
