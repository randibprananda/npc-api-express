import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import { importEvent,uploadFile } from '../../controller/ImportEventController'

const router = Router()

router.post('/import-data-event',uploadFile.single('file'),[checkJwt,importEvent])

export default router

