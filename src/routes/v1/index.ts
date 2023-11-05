import { Router } from 'express'
import RouteAuth from './RouteAuth'
import routerAthletes from './RouteAtheletes'
import routerNews from './RouteNews'
import routerEvent from './RouteEvent'
import routerSport from './RouteSport'
import routerUser from './RouteUserSeeder'
import routeSportType from './RouteSportTypeSeeder'
import routeAdmin from './RouteAdmin'
import routeHeader from './RouteHeader'
import routerImportDataSport from './RouteImportDataSport'
import routerImportDataAtheletes from './RouteImportAtheletes'
import routerImportNews from './RouteImportDataNews'
import routerImportEvent from './RouteImportEvent'







const router = Router()

router.use('/auth', RouteAuth)
router.use('/athletes', routerAthletes)
router.use('/news', routerNews)
router.use('/events', routerEvent)
router.use('/sports', routerSport)
router.use('/users', routerUser)
router.use('/sportType', routeSportType)
router.use('/admin', routeAdmin)
router.use('/header', routeHeader)
router.use('/import-sports', routerImportDataSport)
router.use('/import-atheletes', routerImportDataAtheletes)
router.use('/import-news', routerImportNews)
router.use('/import-event', routerImportEvent)








export default router

