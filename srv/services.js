import cds from '@sap/cds'
const LOG = cds.log('processor-service')

export class ProcessorService extends cds.ApplicationService {

    init() {
        const { Incidents } = this.entities
        this.before('UPDATE', Incidents, req => this.onUpdate(req))
        this.before('CREATE', Incidents, req => this.changeUrgencyDueToSubject(req.data))
        return super.init()
    }

    changeUrgencyDueToSubject(data) {
        const urgent = data.title?.match(/urgent/i)
        if (urgent) data.urgency_code = 'H'
    }

    async onUpdate(req) {
        const closed = await SELECT.one(1).from(req.subject).where`status.code = 'C'`
        if (closed) {
            LOG.info(`Incident ${req.data.ID} is closed, cannot update.`)
            req.reject(409, 'INCIDENT_CLOSED')
        }
    }
}
