import type { ReactFlowProps } from "@xyflow/react";
import type { ReactNode } from "react";
import { Background, ReactFlow } from "@xyflow/react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- CSS side-effect import has no type declarations
// @ts-ignore
import "@xyflow/react/dist/style.css";

type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
};

export const Canvas = ({ children, ...props }: CanvasProps) => (
  <ReactFlow
    deleteKeyCode={["Backspace", "Delete"]}
    fitView
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    {...props}
  >
    <Background bgColor="var(--sidebar)" />
    {children}
  </ReactFlow>
);
