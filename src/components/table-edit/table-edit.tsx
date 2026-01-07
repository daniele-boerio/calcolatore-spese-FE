import { Column } from 'primereact/column';
import { DataTable as PrimeDataTable, type DataTableValue, type DataTableValueArray } from 'primereact/datatable';
import { type ReactNode } from 'react';
import Button from '../button/button';
import './table-edit.scss';

export type TableEditProps = {
  className?: string;
  invisible?: boolean;
  id?: string;
  dataKey?: string;
  value: DataTableValueArray;
  columns: EditColumnProps[];
  onCellChange: (id: string, field: string, value: string | boolean | string[]) => void;
  addRow?: () => void;
  deleteRow?: (id: string) => void;
  filters?: Record<string, { value: any; mode?: string }>;
  disabled?: boolean;
  scrollable?: boolean;
};

export type EditColumnProps = {
  field?: string;
  header?: string;
  body?: (
    rowData: DataTableValue & { id: string },
    onChange: (id: string, field: string, value: string | boolean | string[]) => void,
    disabled?: boolean,
  ) => ReactNode;
  width?: string;
  sortable?: boolean;
  filter?: boolean;
};

export default function TableEdit(props: TableEditProps) {

  return (
    <div className={`div-table-edit ${props.className ?? ''} ${props.invisible ? 'invisible' : ''}`}>
      <PrimeDataTable
        id={props.id}
        value={props.value}
        dataKey={props.dataKey || 'id'}
        removableSort
        {...(props.filters && { filter: props.filters, filterDisplay: 'row', globalFilterMatchMode: 'contains' })}
        scrollable={props.scrollable}
      >
        {props.columns.map((col, i) => (
          <Column
            key={col.field ?? '' + i}
            field={col.field}
            header={col.header ?? ''}
            body={(rowData) =>
              col.body ? col.body(rowData, props.onCellChange, props.disabled) : rowData[col.field ?? '']
            }
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
              // Recupera la chiave corretta dalla prop dataKey (con fallback a 'id')
              const idKey = props.dataKey || 'id';
              const rowId = rowData[idKey];
              return (
                <Button
                  icon="pi pi-trash"
                  className="trasparent-danger-button"
                  compact
                  onClick={() => props.deleteRow!(rowId)}
                  disabled={props.disabled}
                />
              );
            }}
          />
        )}
      </PrimeDataTable>

      {props.addRow && (
        <Button label="add_row" className="table-add-button" onClick={props.addRow} disabled={props.disabled} />
      )}
    </div>
  );
}
