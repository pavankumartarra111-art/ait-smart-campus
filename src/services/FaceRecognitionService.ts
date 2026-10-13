import * as faceapi from '@vladmandic/face-api';
import { FaceTemplate } from '../types/campus';

export interface FaceMatchResult {
  isMatch: boolean;
  enrollmentNo?: string;
  studentName?: string;
  confidence: number;
  distance: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  descriptor?: number[];
  faceThumbnail?: string;
}

export class FaceRecognitionEngine {
  private static instance: FaceRecognitionEngine;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private loadError: string | null = null;
  private currentTemplates: FaceTemplate[] = [];

  private constructor() {}

  public static getInstance(): FaceRecognitionEngine {
    if (!FaceRecognitionEngine.instance) {
      FaceRecognitionEngine.instance = new FaceRecognitionEngine();
    }
    return FaceRecognitionEngine.instance;
  }

  public getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      loadError: this.loadError,
      templateCount: this.currentTemplates.length
    };
  }

  public setTemplates(templates: FaceTemplate[]) {
    this.currentTemplates = [...templates];
  }

  public async loadModels(modelPath: string = '/models'): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return this.isLoaded;
    }

    this.isLoading = true;
    this.loadError = null;

    try {
      console.log('Loading face-api neural models from:', modelPath);
      // Load tiny face detector, landmark 68, landmark tiny, recognition model, and ssd mobilenet v1
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath)
      ]);

      this.isLoaded = true;
      this.isLoading = false;
      console.log('Face-api models loaded successfully.');
      return true;
    } catch (err: any) {
      console.warn('Local model load failed, attempting CDN fallback...', err);
      try {
        const cdnPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(cdnPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(cdnPath),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(cdnPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(cdnPath),
          faceapi.nets.ssdMobilenetv1.loadFromUri(cdnPath)
        ]);
        this.isLoaded = true;
        this.isLoading = false;
        console.log('Face-api models loaded via CDN fallback.');
        return true;
      } catch (cdnErr: any) {
        this.isLoading = false;
        this.loadError = cdnErr.message || 'Failed to load face detection neural network weights.';
        console.error('Failed to load face recognition models:', cdnErr);
        return false;
      }
    }
  }

  /**
   * Helper to normalize a 128-dimensional embedding vector to unit length
   */
  public normalizeVector(vec: number[] | Float32Array): number[] {
    const arr = Array.from(vec);
    const norm = Math.sqrt(arr.reduce((sum, v) => sum + v * v, 0)) || 1;
    return arr.map(v => parseFloat((v / norm).toFixed(5)));
  }

  /**
   * Detect single face for student registration from image element, video frame, or canvas
   */
  public async extractFaceEmbedding(
    mediaEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<{
    descriptor: number[];
    confidence: number;
    box: { x: number; y: number; width: number; height: number };
    quality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  } | null> {
    const ready = await this.loadModels();
    if (!ready) {
      throw new Error(this.loadError || 'Face recognition model is not loaded');
    }

    let detection: any = null;

    // Tier 1: Tiny face detector with 320 input size
    try {
      detection = await faceapi
        .detectSingleFace(mediaEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    } catch (_) {}

    // Tier 2: Tiny face detector with 416 input size
    if (!detection) {
      try {
        detection = await faceapi
          .detectSingleFace(mediaEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.25 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
      } catch (_) {}
    }

    // Tier 3: SSD MobileNet v1
    if (!detection && faceapi.nets.ssdMobilenetv1.isLoaded) {
      try {
        detection = await faceapi
          .detectSingleFace(mediaEl, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.30 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
      } catch (_) {}
    }

    if (!detection) return null;

    const normalizedDescriptor = this.normalizeVector(detection.descriptor);
    const score = detection.detection.score || 0.85;
    const box = detection.detection.box;

    let quality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' = 'ACCEPTABLE';
    if (score >= 0.85 && box.width >= 100) {
      quality = 'EXCELLENT';
    } else if (score >= 0.70 && box.width >= 70) {
      quality = 'GOOD';
    } else if (score < 0.50 || box.width < 40) {
      quality = 'POOR';
    }

    return {
      descriptor: normalizedDescriptor,
      confidence: Math.round(score * 100),
      box: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height)
      },
      quality
    };
  }

  /**
   * Scan video frame for all faces and match against known active templates
   */
  public async scanFrameAndRecognize(
    mediaEl: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    activeTemplates?: FaceTemplate[]
  ): Promise<FaceMatchResult[]> {
    const templatesToUse = activeTemplates || this.currentTemplates;
    if (!this.isLoaded) {
      const ok = await this.loadModels();
      if (!ok) return [];
    }

    try {
      let detections: any[] = [];

      // Primary scan using TinyFaceDetector
      try {
        detections = await faceapi
          .detectAllFaces(mediaEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
          .withFaceLandmarks()
          .withFaceDescriptors();
      } catch (_) {}

      // Fallback scan using SSD MobileNet if tiny detector found zero faces
      if ((!detections || detections.length === 0) && faceapi.nets.ssdMobilenetv1.isLoaded) {
        try {
          detections = await faceapi
            .detectAllFaces(mediaEl, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.30 }))
            .withFaceLandmarks()
            .withFaceDescriptors();
        } catch (_) {}
      }

      if (!detections || detections.length === 0) return [];

      const results: FaceMatchResult[] = [];

      for (const det of detections) {
        const queryDescriptor = this.normalizeVector(det.descriptor);
        const box = {
          x: Math.round(det.detection.box.x),
          y: Math.round(det.detection.box.y),
          width: Math.round(det.detection.box.width),
          height: Math.round(det.detection.box.height)
        };

        let bestMatch: FaceTemplate | null = null;
        let minDistance = Infinity;

        // Euclidean distance comparison against registered face embeddings
        for (const tmpl of templatesToUse) {
          if (!tmpl.descriptor || tmpl.descriptor.length === 0) continue;
          const templateVec = this.normalizeVector(tmpl.descriptor);
          const dist = this.euclideanDistance(queryDescriptor, templateVec);
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = tmpl;
          }
        }

        // Calibrated threshold for webcam environment: <= 0.65 is a verified match (standard for unit-normalized 128-d FaceNet embeddings)
        const MATCH_DISTANCE_THRESHOLD = 0.65;
        const isMatch = bestMatch !== null && minDistance <= MATCH_DISTANCE_THRESHOLD;

        // Realistic confidence curve calibrated to Euclidean distance
        const confidence = isMatch
          ? Math.max(75, Math.min(99, Math.round((1 - (minDistance / 0.80)) * 100)))
          : minDistance === Infinity
          ? 10
          : Math.max(10, Math.min(65, Math.round((1 - (minDistance / 1.0)) * 100)));

        results.push({
          isMatch,
          enrollmentNo: isMatch && bestMatch ? bestMatch.enrollmentNo : undefined,
          studentName: isMatch && bestMatch ? bestMatch.studentName : undefined,
          confidence,
          distance: isFinite(minDistance) ? parseFloat(minDistance.toFixed(3)) : 999,
          box,
          descriptor: queryDescriptor
        });
      }

      return results;
    } catch (e) {
      console.error('Frame scanning error:', e);
      return [];
    }
  }

  public euclideanDistance(d1: Float32Array | number[], d2: number[]): number {
    let sum = 0;
    const len = Math.min(d1.length, d2.length);
    for (let i = 0; i < len; i++) {
      const diff = d1[i] - d2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Helper to draw recognition bounding boxes onto an overlay canvas
   */
  public drawOverlays(
    canvas: HTMLCanvasElement,
    results: FaceMatchResult[],
    displaySize: { width: number; height: number }
  ) {
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const res of results) {
      const { box, isMatch, studentName, enrollmentNo, confidence } = res;

      // Color scheme: Emerald green for verified match, Amber for unverified/unknown
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isMatch ? '#10b981' : '#f59e0b';
      ctx.fillStyle = isMatch ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)';

      // Draw box
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Label badge
      const label = isMatch
        ? `VERIFIED: ${studentName} (${enrollmentNo}) [${confidence}%]`
        : `Unknown Identity [${confidence}% Match Distance]`;

      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;

      ctx.fillStyle = isMatch ? '#064e3b' : '#78350f';
      ctx.fillRect(box.x, Math.max(0, box.y - textHeight - 4), textWidth + 14, textHeight + 4);

      ctx.fillStyle = isMatch ? '#a7f3d0' : '#fde68a';
      ctx.fillText(label, box.x + 6, Math.max(textHeight - 2, box.y - 6));
    }
  }
}

export const faceRecognitionService = FaceRecognitionEngine.getInstance();

