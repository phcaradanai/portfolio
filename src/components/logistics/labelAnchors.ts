/**
 * Bridge between the canvas and the DOM label layer: the scene writes world
 * positions here each frame, SceneLabels registers its buttons, and
 * LabelProjector moves each button over its anchor. An id with no anchor is hidden.
 * Plain objects (no three.js) so the DOM layer stays out of the 3D bundle.
 */
export interface Anchor {
  x: number;
  y: number;
  z: number;
}

export const labelAnchors = new Map<string, Anchor>();
export const labelElements = new Map<string, HTMLElement>();

export function setAnchor(id: string, x: number, y: number, z: number) {
  const a = labelAnchors.get(id);
  if (a) {
    a.x = x;
    a.y = y;
    a.z = z;
  } else labelAnchors.set(id, { x, y, z });
}
