using {incidentmanagement as im} from '../db/schema';

// service used by support personnel to manage incidents "processor"

service ProcessorService {
    entity Incidents as projection on im.Incidents;

    @readonly
    entity Customers as projection on im.Customers;
}

annotate ProcessorService.Incidents with @odata.draft.enabled;
annotate ProcessorService with @(requires: 'support');


service AdminService {
    entity Incidents as projection on im.Incidents;
    entity Customers as projection on im.Customers;
}

annotate AdminService with @(requires: 'admin');
