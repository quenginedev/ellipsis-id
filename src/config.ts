/**
 * Default configuration for ellipsis-id
 */
import { FingerprintOptions } from "./types";

/**
 * Default fingerprinting options
 */
export const DEFAULT_OPTIONS: FingerprintOptions = {
  methods: ["basic", "canvas", "webgl", "audio", "fonts", "features"],
  hashAlgorithm: "sha-256",
  includePublicIp: false,
  timeout: 5000,
  stabilityMode: "balanced",
};

/**
 * Timeout values in milliseconds for different operations
 */
export const TIMEOUTS = {
  font: 2000,
  audio: 1000,
  canvas: 500,
  webgl: 500,
  overall: 5000,
};

/**
 * Canvas fingerprinting configuration
 */
export const CANVAS_CONFIG = {
  width: 280,
  height: 200,
  text: "ellipsis-id Fingerprint",
  subText: "Unique canvas data",
};

/**
 * WebGL fingerprinting configuration
 */
export const WEBGL_CONFIG = {
  parameters: [
    "RED_BITS",
    "GREEN_BITS",
    "BLUE_BITS",
    "ALPHA_BITS",
    "DEPTH_BITS",
    "STENCIL_BITS",
    "MAX_VERTEX_ATTRIBS",
    "MAX_VIEWPORT_DIMS",
    "MAX_COMBINED_TEXTURE_IMAGE_UNITS",
    "MAX_VERTEX_TEXTURE_IMAGE_UNITS",
    "MAX_TEXTURE_SIZE",
    "MAX_CUBE_MAP_TEXTURE_SIZE",
    "ALIASED_LINE_WIDTH_RANGE",
    "ALIASED_POINT_SIZE_RANGE",
    "MAX_RENDERBUFFER_SIZE",
  ],
};

/**
 * Common fonts to check for font fingerprinting
 */
export const COMMON_FONTS = [
  "Arial",
  "Arial Black",
  "Arial Narrow",
  "Calibri",
  "Cambria",
  "Cambria Math",
  "Comic Sans MS",
  "Consolas",
  "Courier",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Microsoft Sans Serif",
  "Palatino Linotype",
  "Segoe UI",
  "Tahoma",
  "Times",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Webdings",
];

/**
 * Browser features to detect
 */
export const BROWSER_FEATURES = [
  "Intl",
  "WebAssembly",
  "BigInt",
  "BigInt64Array",
  "BigUint64Array",
  "URL",
  "URLSearchParams",
  "TextEncoder",
  "TextDecoder",
  "AbortController",
  "AbortSignal",
  "Blob",
  "File",
  "FileReader",
  "FileList",
  "DataView",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "WebSocket",
  "WebGLRenderingContext",
  "WebGL2RenderingContext",
  "TouchEvent",
  "SpeechSynthesis",
  "SpeechRecognition",
  "RTCPeerConnection",
  "MediaRecorder",
  "IntersectionObserver",
  "ResizeObserver",
  "PerformanceObserver",
  "MutationObserver",
  "Credential",
  "CredentialsContainer",
  "CryptoKey",
  "SubtleCrypto",
  "Crypto",
  "Bluetooth",
  "BluetoothDevice",
  "BluetoothRemoteGATTCharacteristic",
  "BluetoothRemoteGATTDescriptor",
  "BluetoothRemoteGATTServer",
  "BluetoothRemoteGATTService",
  "PaymentRequest",
  "PaymentResponse",
  "PaymentAddress",
  "ServiceWorker",
  "ServiceWorkerRegistration",
  "Cache",
  "CacheStorage",
  "Notification",
  "PushManager",
  "PushSubscription",
  "PushSubscriptionOptions",
  "Geolocation",
  "GeolocationPosition",
  "GeolocationCoordinates",
  "GeolocationPositionError",
  "Permissions",
  "PermissionStatus",
  "GamepadButton",
  "Gamepad",
  "GamepadEvent",
  "VRDisplay",
  "VRDisplayCapabilities",
  "VRDisplayEvent",
  "VREyeParameters",
  "VRFieldOfView",
  "VRFrameData",
  "VRPose",
  "VRStageParameters",
];
