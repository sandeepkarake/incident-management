import cds from '@sap/cds'

// UI5 apps use relative dataSource URIs (e.g. "odata/v4/processor/") as required for
// deployment to the HTML5 repository. Locally, cds-plugin-ui5 mounts each app below
// its own path (e.g. /ns.incidents/), so redirect /<app>/odata/... to the CAP services.
if (!cds.env.profiles.includes('production')) cds.on('bootstrap', app => {
    app.use((req, _res, next) => {
        req.url = req.url.replace(/^\/[\w.-]+\/odata\//, '/odata/')
        next()
    })
})

export default cds.server
