"use client";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface TileProps {
  id: string;
  editing: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function SortableTile({ id, editing, children, style }: TileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
      }}
    >
      {editing && (
        <div
          {...attributes}
          {...listeners}
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            zIndex: 10,
            cursor: "grab",
            color: "var(--color-text-dim)",
            display: "flex",
            alignItems: "center",
            padding: 2,
          }}
          title="Drag to reorder"
        >
          <GripVertical size={12} />
        </div>
      )}
      {children}
    </div>
  );
}

interface DashboardGridProps {
  tiles: { id: string; node: React.ReactNode; style?: React.CSSProperties }[];
  storageKey?: string;
}

export default function DashboardGrid({ tiles: initialTiles, storageKey = "dashboard-order" }: DashboardGridProps) {
  const [order, setOrder] = useState<string[]>(() => initialTiles.map(t => t.id));
  const [editing, setEditing] = useState(false);

  // Load saved order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        // Only use saved order if it matches the current tile IDs
        const ids = initialTiles.map(t => t.id);
        if (parsed.length === ids.length && parsed.every(id => ids.includes(id))) {
          setOrder(parsed);
        }
      } catch {}
    }
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = order.indexOf(String(active.id));
      const newIdx = order.indexOf(String(over.id));
      const newOrder = arrayMove(order, oldIdx, newIdx);
      setOrder(newOrder);
      localStorage.setItem(storageKey, JSON.stringify(newOrder));
    }
  }

  const tileMap = Object.fromEntries(initialTiles.map(t => [t.id, t]));
  const sorted = order.map(id => tileMap[id]).filter(Boolean);

  return (
    <div>
      {/* Edit toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          className={`btn ${editing ? "btn-accent" : ""}`}
          onClick={() => setEditing(e => !e)}
          style={{ fontSize: 10 }}
        >
          {editing ? "✓ Done" : "Arrange tiles"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map(tile => (
              <SortableTile key={tile.id} id={tile.id} editing={editing} style={tile.style}>
                {tile.node}
              </SortableTile>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
