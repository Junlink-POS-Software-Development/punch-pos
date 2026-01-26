"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DraggableAttributes,
} from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DailyExpensesCard from "./DailyExpensesCard";
import QuantitySoldCard from "./QuantitySoldCard";
import DailyGrossIncomeCard from "./DailyGrossIncomeCard";
import MonthlyGrossCard from "./MonthlyGrossCard";
import CashOnHand from "./CashOnHand";

// Define strict types for the drag handle
export interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  // Inject props safely into children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(
        child as React.ReactElement<{ dragHandleProps: DragHandleProps }>,
        {
          dragHandleProps: { attributes, listeners },
        }
      );
    }
    return child;
  });

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      {childrenWithProps}
    </div>
  );
};

interface DashboardGridProps {
  items: string[];
  onOrderChange: (newOrder: string[]) => void;
}

export const DashboardGrid = ({
  items,
  onOrderChange,
}: DashboardGridProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onOrderChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const renderCard = (id: string) => {
    switch (id) {
      case "cash-on-hand":
        return <CashOnHand />;
      case "daily-gross":
        return <DailyGrossIncomeCard />;
      case "daily-expenses":
        return <DailyExpensesCard />;
      case "monthly-gross":
        return <MonthlyGrossCard />;
      case "quantity-sold":
        return <QuantitySoldCard />;
      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((id) => (
            <SortableItem key={id} id={id}>
              {renderCard(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
