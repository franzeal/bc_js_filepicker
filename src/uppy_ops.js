import { Uppy } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHRUpload from '@uppy/xhr-upload';

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]').content;
}

export function createUppy(
  onBeforeUpload,
  onBeforeFileAdded,
  onComplete,
  getParent,
  dashboardOptions,
) {
  let uppy = null;

  uppy = new Uppy({
    restrictions: {
      maxFileSize: 10737420000,
    },
    onBeforeUpload,
    onBeforeFileAdded,
    locale: document.querySelector('html').getAttribute('lang'),
  });

  uppy.use(Dashboard, {
    disableThumbnailGenerator: true,
    showLinkToFileUploadResult: false,
    closeModalOnClickOutside: true,
    closeAfterFinish: true,
    allowMultipleUploads: false,
    onRequestCloseModal: () => closeAndResetUppyModal(uppy),
    ...dashboardOptions,
  });
  uppy.use(XHRUpload, {
    withCredentials: true,
    fieldName: 'file',
    limit: 1,
    headers: {
      'X-CSRF-Token': csrfToken(),
    },
    timeout: 128 * 1000,
  });

  uppy.on('file-added', (file) => {
    uppy.setFileMeta(file.id, { parent: getParent() });
    if (file.meta.relativePath == null && file.data.webkitRelativePath) {
      uppy.setFileMeta(file.id, { relativePath: file.data.webkitRelativePath });
    }
  });

  uppy.on('complete', (result) => {
    onComplete(result);
  });

  return uppy;
}

function closeAndResetUppyModal(uppy) {
  uppy.getPlugin('Dashboard').closeModal();
  uppy.reset();
}
