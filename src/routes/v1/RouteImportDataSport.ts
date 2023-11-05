import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {importSports,uploadFile} from '../../controller/ImportSportController'

const router = Router()


router.post('/import-data-sport',uploadFile.single('file'),[checkJwt,importSports])


export default router
