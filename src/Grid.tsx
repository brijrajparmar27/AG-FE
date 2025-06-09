/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  ModuleRegistry,
} from "ag-grid-community";
import { ServerSideRowModelModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";
import useGridStats from "./useGridStats";
import "./Grid.css";
import GridStatusBar from "./GridStatusBar";
import {
  GridRow,
  LineOfBusiness,
  SearchRequest,
  SearchResponse,
  StatusId,
} from "./types";

// Register the required modules
ModuleRegistry.registerModules([ServerSideRowModelModule]);

const Grid = () => {
  const [selectedStatus, setSelectedStatus] = useState<StatusId | "ALL">("ALL");
  const gridRef = useRef<AgGridReact>(null);
  const { statuses } = useGridStats();

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs] = useState<ColDef<GridRow>[]>([
    {
      field: "searchText",
      headerName: "Search",
      hide: true,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: ["contains"],
        buttons: ["reset", "apply"],
        closeOnApply: true,
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      filter: "agSetColumnFilter",
      filterParams: {
        // values: statuses.map((status) => status.id),
        values: [
          "ALL",
          "PENDING_RENEWAL",
          "APPROVAL_PENDING",
          "IN_DESIGN",
          "PENDING_QUOTE",
          "QUOTED",
          "BOUND",
          "ISSUED",
          "CLOSED",
        ],
        buttons: ["reset", "apply"],
        closeOnApply: true,
        suppressAndOrCondition: true,
      },
    },
    {
      field: "named_insured",
      headerName: "Named Insured",
      minWidth: 150,
    },
    {
      field: "MNPID",
      headerName: "MN Program ID",
      minWidth: 120,
    },
    {
      field: "line_of_business",
      headerName: "Line of Business",
      cellRenderer: (params: { value: LineOfBusiness[] }) => {
        return params.value.join(", ");
      },
      minWidth: 150,
    },
    { field: "MBU_handler", headerName: "MBU Handler", minWidth: 120 },
    {
      field: "producing_UW",
      headerName: "Producing UW",
      minWidth: 120,
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: false,
      suppressHeaderMenuButton: true,
      suppressMovable: true,
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    const datasource = getServerSideDatasource();
    params.api!.setGridOption("serverSideDatasource", datasource);
  }, []);

  const selectStatus = async (statusId: StatusId | "ALL") => {
    const api = gridRef.current?.api;
    if (!api) return;

    const currentFilterModel = api.getFilterModel();
    const isAll = statusId === "ALL";

    const newFilterModel = {
      ...currentFilterModel,
      status: isAll
        ? undefined
        : {
            filterType: "set",
            values: [statusId],
          },
    };

    // Remove status filter if it's "ALL"
    if (isAll) {
      delete newFilterModel.status;
    }

    await api.setFilterModel(newFilterModel);
    api.onFilterChanged();
    setSelectedStatus(statusId);
  };

  const getServerSideDatasource = (): IServerSideDatasource => {
    return {
      getRows: async (params) => {
        const body: SearchRequest = {
          companyId: "20116",
          groupId: "3194034",
          sortEntries: params.request.sortModel.map((s) => ({
            sort: s.sort,
            colId: s.colId,
          })),
          filterEntries: Object.entries(params.request.filterModel ?? {}).map(
            ([field, filter]) => {
              //if searchText
              if (field === "searchText") {
                return {
                  field: "searchFields",
                  filterAction: "contains",
                  filterValue: filter.filter,
                };
              }
              // handle other types here
              // ..
              // default map
              return {
                field,
                filterAction: "equals",
                filterValue: Array.isArray(filter.values)
                  ? filter.values
                  : [filter.filter],
              };
            }
          ),
          from: params.request.startRow ?? 0,
          size: (params.request.endRow ?? 100) - (params.request.startRow ?? 0),
        };

        try {
          const response = await fetch("http://localhost:3000/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          const data: SearchResponse = await response.json();

          params.success({
            rowData: data.data,
            rowCount: data.total,
          });
        } catch (err) {
          console.error("Fetch failed", err);
          params.fail();
        }
      },
    };
  };

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const api = gridRef.current?.api;
    if (!api) return;

    const existingFilterModel = api.getFilterModel();

    const filterModel = {
      ...existingFilterModel,
      searchText: {
        filterType: "text",
        type: "contains",
        filter: value,
      },
    };

    await api.setFilterModel(filterModel);
    api.onFilterChanged();
  };

  return (
    <div className="grid-container">
      <input
        type="text"
        onChange={handleSearchInput}
        className="search-input"
        placeholder="Search..."
      />
      <GridStatusBar
        selectStatus={selectStatus}
        selectedStatus={selectedStatus}
        statuses={statuses}
      />
      <AgGridReact
        ref={gridRef}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        rowModelType="serverSide"
        onGridReady={onGridReady}
        pagination={true}
        paginationPageSize={10}
        cacheBlockSize={10}
        suppressDragLeaveHidesColumns={true}
        suppressColumnMoveAnimation={true}
        paginationPageSizeSelector={[10, 20, 50, 100]}
      />
    </div>
  );
};

export default Grid;
