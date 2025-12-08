import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { useGlobalState } from '../../store/GlobalState.jsx';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function StepTransactions({ rows, onBack }) {
  const { tableColumns, downloadExport, downloadName } = useGlobalState();

  return (
    <div className="grid-wrapper">
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 12 }}>
          <div>
            <p className="helper-text" style={{ marginBottom: 4 }}>
              Убедитесь, что данные распознаны корректно перед выгрузкой.
            </p>
            <h3 className="section-title">Анализ транзакций</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="secondary-button" type="button" onClick={onBack}>
              Назад
            </button>
            <button className="primary-button" type="button" onClick={downloadExport} disabled={!rows?.length}>
              Скачать {downloadName || 'Excel'}
            </button>
          </div>
        </div>
        <div className="ag-theme-quartz" style={{ width: '100%', height: 480, marginTop: 12 }}>
          {rows?.length ? (
            <AgGridReact
              rowData={rows}
              columnDefs={tableColumns}
              rowHeight={44}
              headerHeight={48}
              pagination
              paginationPageSize={15}
              animateRows
              suppressMenuHide={false}
              rowClassRules={{
                'risk-row-high': ({ data }) => {
                  const value = (data?.risk_level ?? '').toString().toLowerCase();
                  return value === 'high' || value === 'высокий';
                },
                'risk-row-medium': ({ data }) => {
                  const value = (data?.risk_level ?? '').toString().toLowerCase();
                  return value === 'medium' || value === 'средний';
                },
                'risk-row-low': ({ data }) => {
                  const value = (data?.risk_level ?? '').toString().toLowerCase();
                  return value === 'low' || value === 'низкий';
                },
              }}
              defaultColDef={{ filter: true, sortable: true, resizable: true }}
            />
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#536471' }}>
              Таблица появится сразу после загрузки файла.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

StepTransactions.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onBack: PropTypes.func,
};

StepTransactions.defaultProps = {
  onBack: () => {},
};
