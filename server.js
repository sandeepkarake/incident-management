import cds from '@sap/cds'
import { metrics } from '@opentelemetry/api'

// UI5 apps use relative dataSource URIs (e.g. "odata/v4/processor/") as required for
// deployment to the HTML5 repository. Locally, cds-plugin-ui5 mounts each app below
// its own path (e.g. /ns.incidents/), so redirect /<app>/odata/... to the CAP services.
if (!cds.env.profiles.includes('production')) cds.on('bootstrap', app => {
    app.use((req, _res, next) => {
        req.url = req.url.replace(/^\/[\w.-]+\/odata\//, '/odata/')
        next()
    })
})

// Custom metric: number of open incidents with high urgency.
// The meter is created once the server is listening, i.e. after @cap-js/telemetry
// has registered the global MeterProvider (see @cap-js/telemetry README).
let highUrgency
cds.on('listening', () => {
    highUrgency = metrics.getMeter('incident-management').createUpDownCounter('incidents.urgency.high', {
        description: 'Open incidents with high urgency'
    })
})

cds.on('served', ({ ProcessorService }) => {
    const attributes = req => req.tenant ? { 'sap.tenancy.tenant_id': req.tenant } : {}
    // Note: use req.data, the after-handler results don't carry the incident's fields
    // when drafts are activated
    // Increase count when a new incident with high urgency is created
    ProcessorService.after('CREATE', 'Incidents', (_, req) => {
        const { urgency_code, status_code } = req.data
        if (urgency_code === 'H' && status_code !== 'C') highUrgency?.add(1, attributes(req))
    })
    // Reduce count once a high-urgency incident is closed
    ProcessorService.after('UPDATE', 'Incidents', (_, req) => {
        const { urgency_code, status_code } = req.data
        if (urgency_code === 'H' && status_code === 'C') highUrgency?.add(-1, attributes(req))
    })
})

export default cds.server
