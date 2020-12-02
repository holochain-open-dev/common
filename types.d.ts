export interface HolochainEntry {
    id: string;
    _details: HolochainEntryDetails;
}
export interface HolochainEntryDetails {
    membrane: Membrane;
    headers: Header[];
}
export interface Header {
    id: string;
    author: HolochainAgent;
}
export interface HolochainAgent {
    id: string;
}
export interface Membrane {
    id: string;
}
