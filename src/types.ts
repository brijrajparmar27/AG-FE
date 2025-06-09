export type StatusId =
  | "APPROVAL_PENDING"
  | "BOUND"
  | "CLOSED"
  | "IN_DESIGN"
  | "ISSUED"
  | "PENDING_QUOTE"
  | "PENDING_RENEWAL"
  | "QUOTED";

export type LineOfBusiness =
  | "Aqua"
  | "Crop"
  | "Cyber"
  | "D&O"
  | "Energy"
  | "GL";

export interface Status {
  count: number;
  id: StatusId;
  name: string;
}

export interface LineOfBusinessStats {
  statuses: Status[];
  linesOfBusiness: LineOfBusiness[];
}

export interface GridRow {
  _id: string;
  status: StatusId;
  named_insured: string;
  MNPID: string;
  line_of_business: LineOfBusiness[];
  MBU_handler: string;
  producing_UW: string;
  created_at: string;
  searchText: string;
}

export interface SearchResponse {
  data: GridRow[];
  total: number;
  from: number;
  size: number;
}

export interface SearchRequest {
  companyId: string;
  groupId: string;
  sortEntries: Array<{
    sort: string;
    colId: string;
  }>;
  filterEntries: Array<{
    field: string;
    filterAction: string;
    filterValue: string | string[];
  }>;
  from: number;
  size: number;
}
