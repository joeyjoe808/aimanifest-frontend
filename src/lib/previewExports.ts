// Export function for AI agents to trigger live preview updates
interface PreviewPayload {
  html: string;
  css?: string;
  js?: string;
}

let globalPreviewHandler: ((payload: PreviewPayload) => void) | null = null;

export const registerPreviewHandler = (handler: (payload: PreviewPayload) => void) => {
  globalPreviewHandler = handler;
};

export const sendToLivePreview = (payload: PreviewPayload) => {
  if (globalPreviewHandler) {
    globalPreviewHandler(payload);
    return true;
  }
  
  // Fallback: broadcast via custom event
  window.dispatchEvent(new CustomEvent('livePreviewUpdate', { 
    detail: payload 
  }));
  return false;
};

// Make available globally for AI agents
if (typeof window !== 'undefined') {
  (window as any).sendToLivePreview = sendToLivePreview;
}

export default { sendToLivePreview, registerPreviewHandler };