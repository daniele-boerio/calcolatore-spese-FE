import { Column } from 'primereact/column';
import { DataTable as PrimeDataTable, type DataTableValue, type DataTableValueArray } from 'primereact/datatable';
import { type ReactNode } from 'react';
import Button from '../button/button';
import './table-visualization.scss';

export type TableVisualizationProps = {
  className?: string;
  invisible?: boolean;
  id?: string;
  dataKey?: string;
  value: DataTableValueArray;
  columns: VisualizationColumnProps[];
  disabledRows?: string[];
  paginator?: PaginatorProps;
  selectionRow?: SelectionRow;
  filters?: Record<string, { value: any; mode?: string }>;
  deleteRow?: (id: string) => void;
  customRowClassName?: (rowData: DataTableValue) => string | undefined;
};

export type SelectionRow = {
  selectedRow: DataTableValue | undefined;
  onSelectionChange: (value: DataTableValue) => void;
};

export type PaginatorProps = {
  row: number;
  lazy?: boolean;
  totalRecords?: number;
  first?: number;
  onPage?: (event: any) => void;
  loading?: boolean;
};

export type VisualizationColumnProps = {
  field?: string;
  header?: string;
  body?: ReactNode | ((rowData: DataTableValue) => ReactNode);
  width?: string;
  sortable?: boolean;
  filter?: boolean;
};

export default function TableVisualization(props: TableVisualizationProps) {

  return (
    <div className={`div-table-visualization ${props.className ?? ''} ${props.invisible ? 'invisible' : ''}`}>
      <PrimeDataTable
        id={props.id}
        value={props.value}
        dataKey={props.dataKey || 'id'}
        rowClassName={(rowData) =>
          props.disabledRows?.includes(rowData.id)
            ? 'table-row-disabled'
            : props.customRowClassName
              ? props.customRowClassName(rowData)
              : undefined
        }
        paginator={props.paginator ? true : false}
        rows={props.paginator?.row}
        selectionMode={props.selectionRow ? 'single' : undefined}
        selection={props.selectionRow?.selectedRow}
        onSelectionChange={(e: DataTableValue) => props.selectionRow?.onSelectionChange(e.value)}
        {...(props.paginator?.lazy && { lazy: props.paginator.lazy })}
        {...(props.paginator?.totalRecords && { totalRecords: props.paginator.totalRecords })}
        {...(props.paginator?.first && { first: props.paginator.first })}
        {...(props.paginator?.onPage && { onPage: props.paginator?.onPage })}
        {...(props.paginator?.loading && { loading: props.paginator.loading })}
        {...(props.filters && {
          filter: props.filters,
          filterDisplay: 'row',
          globalFilterMatchMode: 'contains',
        })}
        removableSort
      >
        {props.columns.map((col, i) => (
          <Column
            key={col.field ?? '' + i}
            field={col.field}
            header={col.header ?? ''}
            body={typeof col.body === 'function' ? (col.body as (rowData: DataTableValue) => ReactNode) : col.body}
            style={col.width ? { width: col.width } : {}}
            sortable={col.sortable}
            filter={col.filter}
            filterField={col.field}
            filterHeaderClassName="table-filter"
            showFilterMenu={false}
          />
        ))}
        {props.deleteRow && (
          <Column
            body={(rowData) => {
              // Usa il dataKey fornito o 'id' come fallback
              // Recuperiamo l'ID corretto in base al dataKey
              const idKey = props.dataKey || 'id';
              const rowId = (rowData as Record<string, any>)[idKey] as string; // Cast più robusto

              return (
                <Button
                  icon="pi pi-trash"
                  className="trasparent-danger-button"
                  compact // CHIAMIAMO deleteRow con l'ID della riga
                  onClick={() => props.deleteRow!(rowId)}
                />
              );
            }}
          />
        )}
      </PrimeDataTable>
    </div>
  );
}
