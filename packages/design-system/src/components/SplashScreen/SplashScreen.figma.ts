// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9876-201279
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SplashScreen/SplashScreen.tsx
// component=SplashScreen
import figma from 'figma';

// The Figma set has one VARIANT 'Property 1' whose only option is 'Default', so it is not mapped; `visible` defaults to true in code.
export default {
  id: 'splash-screen',
  example: figma.code`<SplashScreen />`,
  imports: ["import { SplashScreen } from '@wallarm-org/design-system/SplashScreen';"],
  metadata: { nestable: false },
};
