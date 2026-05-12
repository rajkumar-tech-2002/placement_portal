import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from './Modal';
import { X, ZoomIn, ZoomOut, Check, RotateCcw } from 'lucide-react';

const SignatureCropModal = ({ isOpen, onClose, image, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Crop Signature</h3>
                            <p className="text-xs text-slate-500 font-medium">Position your signature within the box</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cropper Body */}
                <div className="relative flex-1 bg-slate-100 dark:bg-slate-950 min-h-[300px]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={3 / 1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-5 h-5 text-slate-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <ZoomIn className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-[2] px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Confirm & Save
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set target dimensions as per requirements
    canvas.width = 600;
    canvas.height = 200;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        600,
        200
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export default SignatureCropModal;
