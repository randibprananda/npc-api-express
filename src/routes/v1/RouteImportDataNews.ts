import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import { importNews,uploadFile } from '../../controller/ImporNewsController'

const router = Router()

router.post('/import-data-news',uploadFile.single('file'),[checkJwt,importNews])

export default router