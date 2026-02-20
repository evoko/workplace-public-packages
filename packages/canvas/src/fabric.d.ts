import 'fabric';

export type ShapeType = 'circle';

declare module 'fabric' {
  interface FabricObject {
    shapeType?: ShapeType;
    data?: {
      type: 'PLACE' | 'DEVICE' | 'DESK' | 'PARKING_SPACE' | 'FACILITY';
      id: string;
    };
  }
  interface Canvas {
    lockLightMode?: boolean;
  }
}
