from PIL import Image
import os

class SegWrapper:
    """
    Demo segmentation wrapper: returns precomputed overlay images.
    In production you would load a U-Net or ONNX model and run inference on tile images.
    """
    def __init__(self, model_path=None):
        self.base = os.path.join('data','sample_satellite')

    def get_overlay(self, name='mask_overlay_1.png'):
        path = os.path.join(self.base, name)
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        return path
