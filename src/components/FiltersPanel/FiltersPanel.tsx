import Button from "../Button/Button.tsx";
import { Sidebar } from "primereact/sidebar";
import React from "react";
import "./FiltersPanel.scss";

interface IFiltersPanelProps {
  visible: boolean;
  onHide(): void;
  onApplyFilters(): void;
  children: React.ReactNode;
}

export default function FiltersPanel({
  visible,
  onHide,
  onApplyFilters,
  children,
}: IFiltersPanelProps) {
  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      className="filters-panel"
    >
      <div className="content">
        <div className="filter-content">{children}</div>
        <Button
          label="Show results"
          className="action-button"
          size="small"
          onClick={onApplyFilters}
          buttonStyle={{ width: "100%" }}
        />
      </div>
    </Sidebar>
  );
}
