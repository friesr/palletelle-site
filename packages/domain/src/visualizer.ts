export type VisualizerMode = 'mix-and-match' | 'future-try-on';
export type VisualizerTruthBoundary = 'real-product-image' | 'fixture-illustration' | 'simulated-preview';

export interface ProductVisualAssetRequirement {
  productId: string;
  hasPrimaryImage: boolean;
  hasTransparentCutout: boolean;
  hasBackView: boolean;
  hasColorReference: boolean;
  truthBoundary: VisualizerTruthBoundary;
}

export interface VisualizerInteractionModel {
  mode: VisualizerMode;
  supportsDragAndDrop: boolean;
  supportsLayerToggling: boolean;
  supportsColorExplanation: boolean;
  personalizationBoundary: 'none' | 'profile-aware-non-personalized';
}

export interface VisualizerArchitecture {
  id: string;
  name: string;
  experienceGoal: string;
  interactionModel: VisualizerInteractionModel;
  dataRequirements: ProductVisualAssetRequirement[];
  realVsSimulatedNote: string;
}
