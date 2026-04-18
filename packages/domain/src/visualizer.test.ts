import { describe, expect, it } from 'vitest';
import type { VisualizerArchitecture } from './visualizer';

describe('visualizer architecture scaffolding', () => {
  it('keeps truth boundaries explicit for future visualization', () => {
    const architecture: VisualizerArchitecture = {
      id: 'viz-1',
      name: 'Mix and match foundation',
      experienceGoal: 'Help customers compare outfit components without implying perfect simulation.',
      interactionModel: {
        mode: 'mix-and-match',
        supportsDragAndDrop: true,
        supportsLayerToggling: true,
        supportsColorExplanation: true,
        personalizationBoundary: 'none',
      },
      dataRequirements: [
        {
          productId: 'linen-shirt-001',
          hasPrimaryImage: true,
          hasTransparentCutout: false,
          hasBackView: false,
          hasColorReference: true,
          truthBoundary: 'fixture-illustration',
        },
      ],
      realVsSimulatedNote: 'Current visuals are scaffold-only and must remain labeled when simulated.',
    };

    expect(architecture.dataRequirements[0].truthBoundary).toBe('fixture-illustration');
  });
});
