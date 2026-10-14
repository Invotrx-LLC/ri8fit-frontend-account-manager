import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import {
  Box,
  Button,
  ListItemIcon,
  MenuItem,
  Typography,
  lighten,
  IconButton,
  Modal,
  Select,
  FormControl,
} from "@mui/material";
import {
  AccountCircle,
  CloseOutlined,
  //   DeleteOutline,
  Send,
} from "@mui/icons-material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function ReusableMRT({
  data = [],
  enableRowSelection = false,
  enableRowActions = true,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  onViewProfile,
  onSendEmail,
  enableRowClickModal = true,
  columnData = [],
  onRowClick,
  onDelete,
  height,
  compactMode = false,
  disableDefaultColumnPinning = false,
  ...rest          
}) {
  // ✅ REQUIRED STATE
  // const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  // ✅ COLUMNS
  const columns = useMemo(
    () =>
      columnData.map((col) => ({
        ...col,

        // ✅ default header styles + custom override
        muiTableBodyCellProps: {
          sx: {
            backgroundColor: "white",
            p: "14px 24px", // bigger cell padding
            minWidth: "180px", // increase cell width
            fontSize: "14px",
          },
        },

        // ✅ default cell styles + custom override
        muiTableBodyCellProps: {
          sx: {
            fontSize: compactMode ? "12px" : "13px",
            color: "#374151",
            fontWeight: 500,
            ...(compactMode ? { px: 1.5, py: 1, minWidth: 0 } : {}),
            ...(col.cellSx || {}),
          },
        },
      })),
    [columnData, compactMode],
  );

  // ✅ TABLE INSTANCE
  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection,
    enableRowActions,
    enableColumnFilters: true,
    enableGlobalFilter,
    enableColumnActions: false,
    renderBottomToolbar: false,
    enableStickyHeader: true, // ✅ Header stays fixed

    muiTableContainerProps: {
      sx: {
        maxHeight: `calc(${height} - 48px)`,
        // maxHeight: height,
        overflowY: "auto",
        overflowX: "auto",
        // Optional: custom scrollbar
        "&::-webkit-scrollbar": { width: "6px", height: "8px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#bcc3c3ff",
          borderRadius: "6px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          // backgroundColor: "#00A1A7",
          backgroundColor: "#bcc3c3ff",
        },
      },
    },
    // Column Action UI Controls
    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 60,
        muiTableHeadCellProps: {
          sx: {
            fontSize: "13px",
            fontWeight: 600,
            justifyContent: "center",
            backgroundColor: "#F5F5F5",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            justifyContent: "center",
            px: 1,
          },
        },
      },
    },
    initialState: {
      showGlobalFilter: enableGlobalFilter,
      // columnPinning: {
      //   left: enableRowSelection ? ["mrt-row-select"] : [],
      //   right: enableRowActions ? ["mrt-row-actions"] : [],
      // },
      columnPinning: disableDefaultColumnPinning ? { left: [], right: [] } : {
        left: columnData.slice(0, 3).map((col) => col.accessorKey || col.id),
        right: [
          ...(enableRowActions ? ["mrt-row-actions"] : []),
          ...(columnData.some((c) => c.id === "actions") ? ["actions"] : []),
        ],
      },
    },

    columnFilterDisplayMode: "popover",

    // White background styles
    muiTablePaperProps: {
      sx: { backgroundColor: "white", boxShadow: "none" },
    },
    muiTableHeadCellProps: {
      sx: { backgroundColor: "white" },
    },
    muiTableBodyProps: { sx: { backgroundColor: "white" } },
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: "white",
        p: compactMode ? "10px 12px" : "14px 24px",
        minWidth: compactMode ? 0 : "180px",
        fontSize: compactMode ? "12px" : "14px",
      },
    },

    // muiBottomToolbarProps: {
    //   sx: { backgroundColor: "white", padding: "0px 8px",},
    // },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "white",
        padding: "0px 8px",
        // minHeight: "40px",
      },
    },

    muiPaginationProps: {
      labelRowsPerPage: " ",
      sx: {
        ".MuiTablePagination-toolbar": {
          minHeight: "32px", // ✅ reduces footer height
          padding: "0px 6px", // ✅ main padding control
        },
        ".css-9lr64-MuiFormLabel-root-MuiInputLabel-root": {
          display: "none",
        },
        ".MuiTablePagination-selectLabel": {
          display: "none",
          margin: 0,
          fontSize: "12px",
        },
        ".MuiTablePagination-displayedRows": {
          margin: 0,
          fontSize: "12px",
        },
        ".MuiTablePagination-actions": {
          marginLeft: "8px",
        },
        ".MuiIconButton-root": {
          padding: "4px", // ✅ smaller pagination arrows
        },
      },
    },

    renderTopToolbar: false,

    renderRowActionMenuItems:
      enableRowActions &&
      (({ row, closeMenu }) => [
        <MenuItem
          key="view"
          onClick={() => {
            onDelete?.(row.original);
            closeMenu();
          }}
        >
          <DeleteOutlineOutlinedIcon />
        </MenuItem>,
        // <MenuItem
        //   key="email"
        //   onClick={() => {
        //     onSendEmail?.(row.original);
        //     closeMenu();
        //   }}
        // >
        //   <ListItemIcon>
        //     <Send />
        //   </ListItemIcon>
        //   Send Email
        // </MenuItem>,
      ]),

    // THIS IS THE MISSING PART THAT MAKES ROW CLICK WORK
    // muiTableBodyRowProps: ({ row }) => ({
    //   onClick: () => {
    //     setSelectedRow(row.original);
    //     setModalOpen(true);
    //   },
    //   sx: {
    //     backgroundColor: "#fff",
    //     cursor: "pointer",
    //     "&:hover": {
    //       backgroundColor: "#fff",
    //     },
    //   },
    // }),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        // 1️⃣ Custom row click (highest priority)
        if (onRowClick) {
          onRowClick(row.original);
          return;
        }

        // 2️⃣ Fallback to modal
        if (enableRowClickModal) {
          setSelectedRow(row.original);
          setModalOpen(true);
        }
      },
      sx: {
        backgroundColor: "#ffffff !important",
        cursor: onRowClick || enableRowClickModal ? "pointer" : "default",
        "&:hover": { backgroundColor: "#fff" },
      },
    }),
  });
  const { getState, setPageIndex, setPageSize, getRowCount } = table;

  const { pagination } = getState();
  return (
    <Box
      sx={{
        // height: "calc(100vh - 150px)", // adjust
        height: height, // adjust
        display: "flex",
        flexDirection: "column",
        // border:1
      }}
    >
      {/* ===== TABLE AREA ===== */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        <MaterialReactTable table={table} {...rest} />
      </Box>

      {/* ===== FOOTER ===== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #eee",
          backgroundColor: "white",
          px: 2,
          py: 1,
          flexShrink: 0,
        }}
      >
        <Typography fontSize="13px" fontWeight={500}>
          Total Record Count : {data.length}
        </Typography>

        {/* RIGHT: Pagination Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Rows-per-page dropdown */}
          <FormControl size="small" sx={{ minWidth: 64 }}>
            <Select
              value={pagination.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              sx={{
                fontSize: "12px",
                height: 28,
                ".MuiSelect-select": { py: "2px" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: { fontSize: "12px" },
                },
              }}
            >
              {[5, 10, 25, 50,100].map((size) => (
                <MenuItem key={size} value={size} sx={{ fontSize: "12px" }}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* First page */}
          {/* <IconButton
            size="small"
            onClick={() => setPageIndex(0)}
            disabled={pagination.pageIndex === 0}
          >
            ⏮
          </IconButton> */}

          {/* Previous page */}
          <IconButton
            size="small"
            onClick={() => setPageIndex(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          {/* Page info */}
          <Typography fontSize="12px" color="#555">
            {pagination.pageIndex * pagination.pageSize + 1}–
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              getRowCount(),
            )}
          </Typography>

          {/* Next page */}
          <IconButton
            size="small"
            onClick={() => setPageIndex(pagination.pageIndex + 1)}
            disabled={
              (pagination.pageIndex + 1) * pagination.pageSize >= getRowCount()
            }
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
