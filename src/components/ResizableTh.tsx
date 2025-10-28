import { useRef, useState } from "react";
import "./../assets/home/home.css";

interface ResizableThProps {
  children: React.ReactNode;
  initialWidth?: number;
}

export const ResizableTh: React.FC<ResizableThProps> = ({
  children,
  initialWidth = 150,
}) => {
  const thRef = useRef<HTMLTableHeaderCellElement>(null);
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = thRef.current?.offsetWidth || initialWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + e.clientX - startX;
      setWidth(Math.max(newWidth, 50));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <th
      ref={thRef}
      style={{
        width,
        position: "relative",
        userSelect: isResizing ? "none" : "auto",
        fontWeight: "normal",
      }}
    >
      {children}
      <div
        onMouseDown={startResize}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "5px",
          cursor: "col-resize",
          zIndex: 1,
        }}
      />
    </th>
  );
};
