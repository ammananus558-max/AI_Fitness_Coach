/* ============================================================
   AI FITNESS COACH — FIREBASE STORAGE WRAPPER
   Depends on: firebase-config.js
   ============================================================ */

/*
 * afcUpload(storagePath, file, onProgress)
 * Uploads with progress (0-100) and resolves with the download URL.
 */
window.afcUpload = async function (storagePath, file, onProgress) {
  const fb = await window.afcFirebaseReady();
  const sRef = fb.storageSdk.ref(fb.storage, storagePath);
  const task = fb.storageSdk.uploadBytesResumable(sRef, file);
  return new Promise(function (resolve, reject) {
    task.on("state_changed",
      function (snap) {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      function (err) {
        console.error("Upload failed:", err);
        reject(new Error("Upload failed. " + (err.message || "")));
      },
      async function () {
        try {
          const url = await fb.storageSdk.getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) { reject(e); }
      });
  });
};

/* Choose an image with a hidden input. Returns Promise<File|null>. */
window.afcPickImage = function () {
  return new Promise(function (resolve) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = function () { resolve(input.files && input.files[0] ? input.files[0] : null); };
    input.click();
  });
};
