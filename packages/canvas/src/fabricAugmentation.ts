import 'fabric';

export type ShapeType = 'circle';

/** Valid `data.type` values for canvas objects. */
export type ObjectDataType =
  | 'PLACE'
  | 'DEVICE'
  | 'DESK'
  | 'PARKING_SPACE'
  | 'FACILITY';

declare module 'fabric' {
  interface FabricObject {
    shapeType?: ShapeType;
    data?: {
      type: ObjectDataType;
      id: string;
    };
  }
  interface Canvas {
    lockLightMode?: boolean;
  }
  interface CanvasEvents {
    'background:modified': object;
  }
}
